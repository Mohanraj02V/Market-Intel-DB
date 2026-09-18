from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MarketEventViewSet

router = DefaultRouter()
router.register(r'market-events', MarketEventViewSet, basename='market-event')

urlpatterns = [
    path('', include(router.urls)),
]
