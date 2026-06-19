from django.contrib import admin
from .models import Property, PropertyImage, Amenity, Favorite


class PropertyImageInline(admin.TabularInline):
    model = PropertyImage
    extra = 0


class AmenityInline(admin.TabularInline):
    model = Amenity
    extra = 0


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ['title', 'property_type', 'category', 'city', 'price', 'status', 'owner', 'created_at']
    list_filter = ['property_type', 'category', 'status', 'city', 'is_featured']
    search_fields = ['title', 'city', 'locality', 'owner__email']
    inlines = [PropertyImageInline, AmenityInline]
    actions = ['approve_properties', 'reject_properties']

    def approve_properties(self, request, queryset):
        queryset.update(status='approved')
    approve_properties.short_description = 'Approve selected properties'

    def reject_properties(self, request, queryset):
        queryset.update(status='rejected')
    reject_properties.short_description = 'Reject selected properties'
