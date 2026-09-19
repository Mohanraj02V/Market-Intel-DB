import re

filepath = 'backend/prospects/views.py'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Make sure imports are present
if "from accounts.permissions import IsPRE, IsLQ, IsPREOrLQ" not in content:
    content = "from accounts.permissions import IsPRE, IsLQ, IsPREOrLQ\n" + content

if "from rest_framework.decorators import action" not in content:
    content = "from rest_framework.decorators import action\n" + content

if "from django.utils import timezone" not in content:
    content = "from django.utils import timezone\n" + content

if "LeadQualification" not in content:
    content = content.replace("from .models import Prospect, ProspectOffering, ProspectContact", "from .models import Prospect, ProspectOffering, ProspectContact, LeadQualification")
    
if "LeadQualificationSerializer" not in content:
    content = content.replace("from .serializers import ProspectSerializer", "from .serializers import ProspectSerializer, LeadQualificationSerializer")

# Update ProspectViewSet permission
content = content.replace("permission_classes = [IsAuthenticated]", "permission_classes = [IsPREOrLQ]")

lq_pipeline_viewset = """
class LQPipelineViewSet(viewsets.ModelViewSet):
    serializer_class = LeadQualificationSerializer
    permission_classes = [IsLQ]
    queryset = LeadQualification.objects.all().select_related('prospect').order_by('-updated_at')
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['verification_status', 'pre_task_status', 'qualification_status']
    search_fields = ['prospect__company_name', 'prospect__country_head_office', 'prospect__primary_industries']
    ordering_fields = ['created_at', 'updated_at', 'qualification_score']

    @action(detail=True, methods=['post'], url_path='report-issue')
    def report_issue(self, request, pk=None):
        lq = self.get_object()
        lq.pre_task_status = LeadQualification.PreTaskStatus.ISSUE_SENT_TO_PRE
        lq.issue_category = request.data.get('issue_category', '')
        lq.issue_details = request.data.get('issue_details', '')
        lq.issue_reported_by = request.user
        lq.issue_reported_at = timezone.now()
        lq.save()
        return Response(self.get_serializer(lq).data)

    @action(detail=True, methods=['post'], url_path='confirm-reverification')
    def confirm_reverification(self, request, pk=None):
        lq = self.get_object()
        lq.pre_task_status = LeadQualification.PreTaskStatus.NONE
        lq.save()
        return Response(self.get_serializer(lq).data)

    @action(detail=True, methods=['post'], url_path='verify')
    def verify(self, request, pk=None):
        lq = self.get_object()
        lq.verification_status = request.data.get('verification_status', lq.verification_status)
        lq.save()
        return Response(self.get_serializer(lq).data)

    @action(detail=True, methods=['post'], url_path='qualification')
    def qualification(self, request, pk=None):
        lq = self.get_object()
        lq.qualification_status = request.data.get('qualification_status', lq.qualification_status)
        lq.qualification_score = request.data.get('qualification_score', lq.qualification_score)
        lq.lq_notes = request.data.get('lq_notes', lq.lq_notes)
        lq.budget = request.data.get('budget', lq.budget)
        lq.authority = request.data.get('authority', lq.authority)
        lq.need = request.data.get('need', lq.need)
        lq.timeline = request.data.get('timeline', lq.timeline)
        lq.qualified_by = request.user
        lq.qualified_at = timezone.now()
        lq.save()
        return Response(self.get_serializer(lq).data)
"""

if "class LQPipelineViewSet" not in content:
    content += lq_pipeline_viewset
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Added LQPipelineViewSet to views.py")
