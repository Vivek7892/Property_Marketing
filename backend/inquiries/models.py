from django.db import models
from django.conf import settings
from properties.models import Property


class Inquiry(models.Model):
    TYPES = [('question', 'Question'), ('visit', 'Schedule Visit'), ('offer', 'Make Offer')]
    STATUS = [('pending', 'Pending'), ('responded', 'Responded'), ('closed', 'Closed')]

    buyer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_inquiries')
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='inquiries')
    inquiry_type = models.CharField(max_length=10, choices=TYPES, default='question')
    message = models.TextField()
    visit_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=12, choices=STATUS, default='pending')
    response = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.buyer.full_name} → {self.property.title}'
