from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProspectViewSet, LQPipelineViewSet, CallbackReminderViewSet, ProspectContactViewSet, CommunicationActivityViewSet, CallActivityViewSet, OutreachEmailViewSet, EmailTrackingView
from .verification_views import EmailVerificationViewSet

router = DefaultRouter()
router.register(r'prospects', ProspectViewSet, basename='prospect')
router.register(r'lq-pipeline', LQPipelineViewSet, basename='lq-pipeline')
router.register(r'reminders', CallbackReminderViewSet, basename='reminders')

router.register(r'key-contacts', ProspectContactViewSet, basename='key-contacts')
router.register(r'outreach/communications', CommunicationActivityViewSet, basename='communications')
router.register(r'outreach/calls', CallActivityViewSet, basename='outreach-calls')
router.register(r'outreach/emails', OutreachEmailViewSet, basename='outreach-emails')
router.register(r'email-verifications', EmailVerificationViewSet, basename='email-verifications')

urlpatterns = [
    path('email-tracking/<uuid:tracking_token>/', EmailTrackingView.as_view(), name='email-tracking'),
    path('', include(router.urls)),
]
