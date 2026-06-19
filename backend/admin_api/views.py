from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from rest_framework import status
from accounts.models import User
from accounts.serializers import UserSerializer
from properties.models import Property
from inquiries.models import Inquiry
from chat.models import Message


class AdminStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        return Response({
            'total_users': User.objects.count(),
            'total_properties': Property.objects.count(),
            'pending_properties': Property.objects.filter(status='pending').count(),
            'approved_properties': Property.objects.filter(status='approved').count(),
            'sale_listings': Property.objects.filter(category='sale', status='approved').count(),
            'rent_listings': Property.objects.filter(category='rent', status='approved').count(),
            'lease_listings': Property.objects.filter(category='lease', status='approved').count(),
            'total_inquiries': Inquiry.objects.count(),
            'total_messages': Message.objects.count(),
            'agents': User.objects.filter(user_type='agent').count(),
            'sellers': User.objects.filter(user_type='seller').count(),
            'buyers': User.objects.filter(user_type='buyer').count(),
        })


class AdminUserListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        users = User.objects.all().order_by('-created_at')
        return Response(UserSerializer(users, many=True).data)

    def patch(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
            user.is_active = request.data.get('is_active', user.is_active)
            user.user_type = request.data.get('user_type', user.user_type)
            user.save()
            return Response(UserSerializer(user).data)
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
