from django.db import models
from django.conf import settings
from properties.models import Property


class ChatRoom(models.Model):
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='chat_rooms')
    buyer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='buyer_chats')
    seller = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='seller_chats')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['property', 'buyer', 'seller']
        ordering = ['-updated_at']

    def __str__(self):
        return f'{self.buyer.full_name} ↔ {self.seller.full_name} | {self.property.title}'


class Message(models.Model):
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']
