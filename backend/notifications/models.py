from django.db import models
from django.conf import settings


class Notification(models.Model):
    TYPES = [
        ('inquiry', 'New Inquiry'), ('message', 'New Message'),
        ('approved', 'Property Approved'), ('rejected', 'Property Rejected'),
        ('expiring', 'Property Expiring'),
    ]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=15, choices=TYPES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    link = models.CharField(max_length=300, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
