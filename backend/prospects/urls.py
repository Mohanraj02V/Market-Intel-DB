from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProspectViewSet, LQPipelineViewSet, CallbackReminderViewSet, OutreachLogViewSet, ProspectContactViewSet

router = DefaultRouter()
router.register(r'prospects', ProspectViewSet, basename='prospect')
router.register(r'lq-pipeline', LQPipelineViewSet, basename='lq-pipeline')
router.register(r'reminders', CallbackReminderViewSet, basename='reminders')
router.register(r'outreach-logs', OutreachLogViewSet, basename='outreach-logs')
router.register(r'key-contacts', ProspectContactViewSet, basename='key-contacts')

urlpatterns = [
    path('', include(router.urls)),
]
