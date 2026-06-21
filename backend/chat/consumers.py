import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import ChatRoom, Message


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'chat_{self.room_id}'
        user = self.scope['user']

        if not user.is_authenticated:
            await self.close()
            return

        room = await self.get_room()
        if not room or (user != room.buyer and user != room.seller):
            await self.close()
            return

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        user = self.scope['user']

        # Handle typing indicator — broadcast without saving
        if data.get('type') == 'typing':
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'typing_indicator',
                    'sender_id': str(user.id),
                }
            )
            return

        # Handle chat message
        message_text = data.get('message', '').strip()
        if not message_text:
            return

        message = await self.save_message(message_text)
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message_text,
                'sender_id': str(user.id),
                'sender_name': user.full_name,
                'sender_type': user.user_type,
                'message_id': message.id,
                'created_at': message.created_at.isoformat(),
            }
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event))

    async def typing_indicator(self, event):
        await self.send(text_data=json.dumps({
            'type': 'typing',
            'sender_id': event['sender_id'],
        }))

    @database_sync_to_async
    def get_room(self):
        try:
            return ChatRoom.objects.select_related('buyer', 'seller').get(id=self.room_id)
        except ChatRoom.DoesNotExist:
            return None

    @database_sync_to_async
    def save_message(self, content):
        from django.utils import timezone
        ChatRoom.objects.filter(id=self.room_id).update(updated_at=timezone.now())
        return Message.objects.create(
            room_id=self.room_id,
            sender=self.scope['user'],
            content=content
        )
