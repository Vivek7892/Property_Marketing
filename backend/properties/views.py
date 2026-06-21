from rest_framework import viewsets, generics, status, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
import cloudinary.uploader
from .models import Property, PropertyImage, Favorite
from .serializers import PropertySerializer, PropertyListSerializer, FavoriteSerializer, PropertyImageSerializer
from .filters import PropertyFilter
from .permissions import IsOwnerOrReadOnly, IsAdminOrReadOnly


class PropertyViewSet(viewsets.ModelViewSet):
    queryset = Property.objects.filter(status='approved').select_related('owner').prefetch_related('images', 'amenities')
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = PropertyFilter
    search_fields = ['title', 'locality', 'city', 'state', 'description']
    ordering_fields = ['price', 'created_at', 'area_sqft', 'views_count']
    ordering = ['-created_at']
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_serializer_class(self):
        if self.action == 'list':
            return PropertyListSerializer
        return PropertySerializer

    def get_permissions(self):
        if self.action in ['create']:
            return [permissions.IsAuthenticated()]
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsOwnerOrReadOnly()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        qs = super().get_queryset()
        if self.action in ['my_properties', 'update', 'partial_update', 'destroy']:
            return Property.objects.filter(owner=self.request.user)
        return qs

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.views_count += 1
        instance.save(update_fields=['views_count'])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_properties(self, request):
        props = Property.objects.filter(owner=request.user)
        page = self.paginate_queryset(props)
        serializer = PropertyListSerializer(page, many=True, context={'request': request})
        return self.get_paginated_response(serializer.data)

    @action(detail=False, methods=['get'])
    def featured(self, request):
        props = Property.objects.filter(status='approved', is_featured=True)[:8]
        serializer = PropertyListSerializer(props, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def add_images(self, request, pk=None):
        prop = self.get_object()
        if prop.owner != request.user:
            return Response({'error': 'Not allowed.'}, status=status.HTTP_403_FORBIDDEN)
        images = request.FILES.getlist('images')
        created = [PropertyImage.objects.create(property=prop, image=img) for img in images]
        return Response(PropertyImageSerializer(created, many=True).data)

    @action(detail=False, methods=['get'])
    def nearby(self, request):
        lat = float(request.query_params.get('lat', 0))
        lng = float(request.query_params.get('lng', 0))
        radius = float(request.query_params.get('radius', 10))
        # Approximate bounding box (1 degree ≈ 111 km)
        delta = radius / 111.0
        props = Property.objects.filter(
            status='approved',
            latitude__range=(lat - delta, lat + delta),
            longitude__range=(lng - delta, lng + delta)
        )[:20]
        serializer = PropertyListSerializer(props, many=True, context={'request': request})
        return Response(serializer.data)


class PropertyImageDeleteView(generics.DestroyAPIView):
    queryset = PropertyImage.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def destroy(self, request, *args, **kwargs):
        img = self.get_object()
        if img.property.owner != request.user:
            return Response({'error': 'Not allowed.'}, status=status.HTTP_403_FORBIDDEN)
        img.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class FavoriteListView(generics.ListAPIView):
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user).select_related('property')


class ToggleFavoriteView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            prop = Property.objects.get(pk=pk)
            fav, created = Favorite.objects.get_or_create(user=request.user, property=prop)
            if not created:
                fav.delete()
                return Response({'status': 'removed'})
            return Response({'status': 'added'})
        except Property.DoesNotExist:
            return Response({'error': 'Property not found.'}, status=status.HTTP_404_NOT_FOUND)


class AdminPropertyViewSet(viewsets.ModelViewSet):
    queryset = Property.objects.all().select_related('owner').prefetch_related('images')
    serializer_class = PropertySerializer
    permission_classes = [permissions.IsAdminUser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_class = PropertyFilter
    search_fields = ['title', 'city', 'owner__email']

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        prop = self.get_object()
        prop.status = 'approved'
        prop.save()
        return Response({'message': 'Property approved.'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        prop = self.get_object()
        prop.status = 'rejected'
        prop.save()
        return Response({'message': 'Property rejected.'})


class CloudinaryUploadView(APIView):
    """Signed upload endpoint — receives file, uploads to Cloudinary, returns secure URL."""
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file = request.FILES.get('file')
        folder = request.data.get('folder', 'property_hub/properties')

        if not file:
            return Response({'error': 'No file provided.'}, status=status.HTTP_400_BAD_REQUEST)

        # Validate file type
        allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
        if file.content_type not in allowed:
            return Response({'error': 'Only JPEG, PNG, and WebP images allowed.'}, status=status.HTTP_400_BAD_REQUEST)

        # Validate file size (max 10MB)
        if file.size > 10 * 1024 * 1024:
            return Response({'error': 'File size must be under 10MB.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            result = cloudinary.uploader.upload(
                file,
                folder=folder,
                transformation=[
                    {'quality': 'auto', 'fetch_format': 'auto'},
                ],
                resource_type='image',
            )
            return Response({
                'url': result['secure_url'],
                'public_id': result['public_id'],
                'width': result.get('width'),
                'height': result.get('height'),
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
