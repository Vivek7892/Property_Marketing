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
    images          = PropertyImageSerializer(many=True, read_only=True)
    amenities       = AmenitySerializer(many=True, read_only=True)
    owner           = UserSerializer(read_only=True)
    is_favorited    = serializers.SerializerMethodField()
    uploaded_image_urls = serializers.ListField(
        child=serializers.CharField(), write_only=True, required=False
    )
    amenity_list    = serializers.ListField(
        child=serializers.CharField(), write_only=True, required=False
    )

    class Meta:
        model  = Property
        fields = '__all__'
        read_only_fields = ['id', 'owner', 'status', 'views_count', 'created_at', 'updated_at']

    def get_is_favorited(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.favorited_by.filter(user=request.user).exists()
        return False

    def _save_images(self, prop, image_urls):
        """Save image URLs — first one is primary, clear existing primary flag."""
        if not image_urls:
            return
        # Clear any stale primary flags
        prop.images.update(is_primary=False)
        for i, url in enumerate(image_urls):
            PropertyImage.objects.create(
                property=prop,
                image=url,
                is_primary=(i == 0)
            )

    def create(self, validated_data):
        image_urls   = validated_data.pop('uploaded_image_urls', [])
        amenity_names = validated_data.pop('amenity_list', [])
        validated_data['owner'] = self.context['request'].user
        prop = Property.objects.create(**validated_data)
        self._save_images(prop, image_urls)
        for name in amenity_names:
            Amenity.objects.create(property=prop, name=name)
        return prop

    def update(self, instance, validated_data):
        image_urls    = validated_data.pop('uploaded_image_urls', [])
        amenity_names = validated_data.pop('amenity_list', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        self._save_images(instance, image_urls)
        if amenity_names is not None:
            instance.amenities.all().delete()
            for name in amenity_names:
                Amenity.objects.create(property=instance, name=name)
        return instance


class PropertyListSerializer(serializers.ModelSerializer):
    primary_image = serializers.SerializerMethodField()
    owner_name    = serializers.CharField(source='owner.full_name', read_only=True)
    is_favorited  = serializers.SerializerMethodField()

    class Meta:
        model  = Property
        fields = [
            'id', 'title', 'property_type', 'category', 'price', 'area_sqft',
            'bedrooms', 'bathrooms', 'locality', 'city', 'state', 'status',
            'primary_image', 'owner_name', 'is_favorited', 'is_featured',
            'is_negotiable', 'advance_amount', 'created_at',
        ]

    def get_primary_image(self, obj):
        img = obj.images.filter(is_primary=True).first() or obj.images.first()
        return img.image if img else None

    def get_is_favorited(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.favorited_by.filter(user=request.user).exists()
        return False


class FavoriteSerializer(serializers.ModelSerializer):
    property = PropertyListSerializer(read_only=True)

    class Meta:
        model  = Favorite
        fields = ['id', 'property', 'created_at']
