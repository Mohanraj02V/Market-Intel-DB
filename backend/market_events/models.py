import datetime
import uuid
from django.db import models
from django.conf import settings

class MarketEvent(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event_title = models.CharField(max_length=255)
    host_country = models.CharField(max_length=255)
    start_date = models.DateField(default=datetime.date.today)
    end_date = models.DateField(default=datetime.date.today)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.CharField(max_length=255, blank=True, null=True)
    updated_by = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return self.event_title


class MarketEventParticipation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    market_event = models.ForeignKey(
        MarketEvent,
        related_name='participations',
        on_delete=models.CASCADE
    )
    prospect = models.ForeignKey(
        'prospects.Prospect',
        related_name='market_event_participations',
        on_delete=models.CASCADE
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["market_event", "prospect"],
                name="unique_market_event_prospect"
            )
        ]
        indexes = [
            models.Index(fields=['market_event']),
            models.Index(fields=['prospect']),
        ]

    def __str__(self):
        return f"{self.prospect} - {self.market_event}"
