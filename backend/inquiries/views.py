from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Inquiry
from .serializers import InquirySerializer, InquiryResponseSerializer


class InquiryCreateView(generics.CreateAPIView):
    serializer_class = InquirySerializer
    permission_classes = [permissions.IsAuthenticated]


class BuyerInquiryListView(generics.ListAPIView):
    serializer_class = InquirySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Inquiry.objects.filter(buyer=self.request.user).select_related('property', 'buyer')


class SellerInquiryListView(generics.ListAPIView):
    serializer_class = InquirySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Inquiry.objects.filter(
            property__owner=self.request.user
        ).select_related('property', 'buyer')


class InquiryRespondView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            inquiry = Inquiry.objects.get(pk=pk, property__owner=request.user)
        except Inquiry.DoesNotExist:
            return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = InquiryResponseSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        inquiry.response = serializer.validated_data['response']
        inquiry.status = 'responded'
        inquiry.save()
        return Response({'message': 'Response sent.'})
