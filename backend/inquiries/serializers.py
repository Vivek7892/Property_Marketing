from rest_framework import serializers
from .models import Inquiry
from accounts.serializers import UserSerializer
from properties.serializers import PropertyListSerializer


class InquirySerializer(serializers.ModelSerializer):
    buyer = UserSerializer(read_only=True)
    property_detail = PropertyListSerializer(source='property', read_only=True)

    class Meta:
        model = Inquiry
        fields = '__all__'
        read_only_fields = ['buyer', 'status', 'response', 'created_at']

    def create(self, validated_data):
        validated_data['buyer'] = self.context['request'].user
        return super().create(validated_data)


class InquiryResponseSerializer(serializers.Serializer):
    response = serializers.CharField()
