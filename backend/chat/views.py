from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import ChatRoom, Message
from .serializers import ChatRoomSerializer, MessageSerializer
from properties.models import Property


class ChatRoomListView(generics.ListAPIView):
    serializer_class = ChatRoomSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return ChatRoom.objects.filter(
            buyer=user
        ) | ChatRoom.objects.filter(seller=user)


class GetOrCreateRoomView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        property_id = request.data.get('property_id')
        try:
            prop = Property.objects.get(id=property_id)
        except Property.DoesNotExist:
            return Response({'error': 'Property not found.'}, status=status.HTTP_404_NOT_FOUND)
        if prop.owner == request.user:
            return Response({'error': 'Cannot chat with yourself.'}, status=status.HTTP_400_BAD_REQUEST)
        room, _ = ChatRoom.objects.get_or_create(
            property=prop, buyer=request.user, seller=prop.owner
        )
        return Response(ChatRoomSerializer(room, context={'request': request}).data)


class MessageListView(generics.ListAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        room_id = self.kwargs['room_id']
        user = self.request.user
        room = ChatRoom.objects.filter(
            id=room_id
        ).filter(buyer=user) | ChatRoom.objects.filter(id=room_id, seller=user)
        if not room.exists():
            return Message.objects.none()
        Message.objects.filter(room_id=room_id).exclude(sender=user).update(is_read=True)
        return Message.objects.filter(room_id=room_id)
