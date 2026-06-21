from django_filters import rest_framework as filters
from .models import Property


class PropertyFilter(filters.FilterSet):
    min_price    = filters.NumberFilter(field_name='price',    lookup_expr='gte')
    max_price    = filters.NumberFilter(field_name='price',    lookup_expr='lte')
    min_area     = filters.NumberFilter(field_name='area_sqft', lookup_expr='gte')
    max_area     = filters.NumberFilter(field_name='area_sqft', lookup_expr='lte')
    min_bedrooms = filters.NumberFilter(field_name='bedrooms', lookup_expr='gte')

    class Meta:
        model  = Property
        fields = [
            'property_type', 'category', 'city', 'state', 'locality',
            'furnished_status', 'parking', 'bedrooms', 'bathrooms',
            'status', 'facing', 'is_corner_plot', 'is_gated',
        ]
