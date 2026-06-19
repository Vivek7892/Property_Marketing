from rest_framework import serializers
from .models import Property, PropertyImage, Amenity, Favorite
from accounts.serializers import UserSerializer


class PropertyImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyImage
        fields = ['id', 'image', 'is_primary']


class AmenitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Amenity
        fields = ['id', 'name']


class PropertySerializer(serializers.ModelSerializer):
    images = PropertyImageSerializer(many=True, read_only=True)
    amenities = AmenitySerializer(many=True, read_only=True)
    owner = UserSerializer(read_only=True)
    is_favorited = serializers.SerializerMethodField()
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(), write_only=True, required=False
    )
    amenity_list = serializers.ListField(
        child=serializers.CharField(), write_only=True, required=False
    )

    class Meta:
        model = Property
        fields = '__all__'
        read_only_fields = ['id', 'owner', 'status', 'views_count', 'created_at', 'updated_at']

    def get_is_favorited(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.favorited_by.filter(user=request.user).exists()
        return False

    def create(self, validated_data):
        images = validated_data.pop('uploaded_images', [])
        amenity_names = validated_data.pop('amenity_list', [])
        validated_data['owner'] = self.context['request'].user
        prop = Property.objects.create(**validated_data)
        for i, img in enumerate(images):
            PropertyImage.objects.create(property=prop, image=img, is_primary=(i == 0))
        for name in amenity_names:
            Amenity.objects.create(property=prop, name=name)
        return prop


class PropertyListSerializer(serializers.ModelSerializer):
    primary_image = serializers.SerializerMethodField()
    owner_name = serializers.CharField(source='owner.full_name', read_only=True)
    is_favorited = serializers.SerializerMethodField()

    class Meta:
        model = Property
        fields = ['id', 'title', 'property_type', 'category', 'price', 'area_sqft',
                  'bedrooms', 'bathrooms', 'locality', 'city', 'state', 'status',
                  'primary_image', 'owner_name', 'is_favorited', 'is_featured',
                  'is_negotiable', 'created_at']

    def get_primary_image(self, obj):
        img = obj.images.filter(is_primary=True).first() or obj.images.first()
        if img:
            request = self.context.get('request')
            return request.build_absolute_uri(img.image.url) if request else img.image.url
        return None

    def get_is_favorited(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.favorited_by.filter(user=request.user).exists()
        return False


class FavoriteSerializer(serializers.ModelSerializer):
    property = PropertyListSerializer(read_only=True)

    class Meta:
        model = Favorite
        fields = ['id', 'property', 'created_at']
