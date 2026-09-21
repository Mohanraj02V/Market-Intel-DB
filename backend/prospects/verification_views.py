from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import EmailVerification, Prospect, ProspectContact, LeadQualification
from .verification_serializers import EmailVerificationSerializer
from .services import verify_email_engine
from accounts.permissions import IsLQ, IsPREOrLQ

class EmailVerificationViewSet(viewsets.ModelViewSet):
    queryset = EmailVerification.objects.all()
    serializer_class = EmailVerificationSerializer
    permission_classes = [IsPREOrLQ]

    @action(detail=False, methods=['post'], url_path='instant-verify', permission_classes=[IsPREOrLQ])
    def instant_verify(self, request):
        email_address = request.data.get('email_address')
        if not email_address:
            return Response({'error': 'email_address is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        engine_result = verify_email_engine(email_address)
        return Response({'verification_status': engine_result['status'], 'reason': engine_result['reason']}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], permission_classes=[IsPREOrLQ])
    def verify(self, request):
        prospect_id = request.data.get('prospect_id')
        prospect_contact_id = request.data.get('prospect_contact_id')
        email_address = request.data.get('email_address')

        if not prospect_id or not email_address:
            return Response({'error': 'prospect_id and email_address are required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            prospect = Prospect.objects.get(id=prospect_id)
        except Prospect.DoesNotExist:
            return Response({'error': 'Prospect not found.'}, status=status.HTTP_404_NOT_FOUND)

        prospect_contact = None
        if prospect_contact_id:
            try:
                prospect_contact = ProspectContact.objects.get(id=prospect_contact_id, prospect=prospect)
            except ProspectContact.DoesNotExist:
                return Response({'error': 'ProspectContact not found or does not belong to Prospect.'}, status=status.HTTP_404_NOT_FOUND)

            if prospect_contact.official_email != email_address:
                return Response({'error': 'Email address does not match current contact email.'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            if prospect.official_email_address != email_address:
                return Response({'error': 'Email address does not match current prospect email.'}, status=status.HTTP_400_BAD_REQUEST)

        # Perform Verification
        engine_result = verify_email_engine(email_address)

        # Update or Create Verification Record
        verification, created = EmailVerification.objects.update_or_create(
            prospect=prospect,
            prospect_contact=prospect_contact,
            email_address=email_address,
            defaults={
                'verification_status': engine_result['status'],
                'syntax_valid': engine_result['syntax_valid'],
                'domain_valid': engine_result['domain_valid'],
                'mx_found': engine_result['mx_found'],
                'smtp_checked': engine_result['smtp_checked'],
                'smtp_valid': engine_result['smtp_valid'],
                'is_disposable': engine_result['is_disposable'],
                'is_role_account': engine_result['is_role_account'],
                'is_catch_all': engine_result['is_catch_all'],
                'reason': engine_result['reason'],
                'verified_at': timezone.now(),
                'verified_by': request.user,
                'confirmed_by_lq': None,
                'confirmed_at': None
            }
        )

        # If invalid, automatically trigger a PRE task
        if verification.verification_status == 'INVALID':
            try:
                lq = prospect.lead_qualification
                if lq.pre_task_status != LeadQualification.PreTaskStatus.ISSUE_SENT_TO_PRE:
                    lq.pre_task_status = LeadQualification.PreTaskStatus.ISSUE_SENT_TO_PRE
                    lq.issue_category = 'Email Verification'
                    lq.issue_details = f"The recipient email could not be verified. Current email: {email_address}. Verification result: Invalid. Reason: {engine_result['reason']}"
                    lq.issue_reported_by = request.user
                    lq.issue_reported_at = timezone.now()
                    lq.save()
            except LeadQualification.DoesNotExist:
                pass

        serializer = self.get_serializer(verification)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[IsPREOrLQ])
    def confirm(self, request, pk=None):
        verification = self.get_object()

        if verification.verification_status != 'VALID':
            return Response({'error': 'Can only confirm VALID email verifications.'}, status=status.HTTP_400_BAD_REQUEST)

        # Ensure email hasn't changed since verification
        current_email = verification.prospect_contact.official_email if verification.prospect_contact else verification.prospect.official_email_address
        if verification.email_address != current_email:
            return Response({'error': 'Email address has changed since verification. Re-verification required.'}, status=status.HTTP_400_BAD_REQUEST)

        verification.confirmed_by_lq = request.user
        verification.confirmed_at = timezone.now()
        verification.save()

        # Clear PRE task if it was resolved
        try:
            lq = verification.prospect.lead_qualification
            if lq.pre_task_status == LeadQualification.PreTaskStatus.PRE_UPDATED and lq.issue_category == 'Email Verification':
                lq.pre_task_status = LeadQualification.PreTaskStatus.NONE
                lq.save()
        except LeadQualification.DoesNotExist:
            pass

        serializer = self.get_serializer(verification)
        return Response(serializer.data, status=status.HTTP_200_OK)
