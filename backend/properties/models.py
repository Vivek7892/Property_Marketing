from django.db import models
from django.conf import settings
import uuid


class Property(models.Model):
    PROPERTY_TYPES = [
        ('house', 'House'), ('apartment', 'Apartment'), ('villa', 'Villa'),
        ('plot', 'Site/Plot'), ('shop', 'Shop'), ('office', 'Office Space'),
        ('commercial', 'Commercial Building'), ('warehouse', 'Warehouse'),
    ]
    CATEGORIES = [('sale', 'Sale'), ('rent', 'Rent'), ('lease', 'Lease')]
    FURNISHED = [('unfurnished', 'Unfurnished'), ('semi', 'Semi-Furnished'), ('furnished', 'Furnished')]
    STATUS = [('pending', 'Pending'), ('approved', 'Approved'), ('rejected', 'Rejected'), ('sold', 'Sold')]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='properties')
    title = models.CharField(max_length=300)
    description = models.TextField()
    property_type = models.CharField(max_length=20, choices=PROPERTY_TYPES)
    category = models.CharField(max_length=10, choices=CATEGORIES)
    price = models.DecimalField(max_digits=15, decimal_places=2)
    is_negotiable = models.BooleanField(default=False)
    area_sqft = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    bedrooms = models.PositiveSmallIntegerField(default=0)
    bathrooms = models.PositiveSmallIntegerField(default=0)
    balconies = models.PositiveSmallIntegerField(default=0)
    parking = models.BooleanField(default=False)
    furnished_status = models.CharField(max_length=15, choices=FURNISHED, default='unfurnished')
    address = models.TextField()
    locality = models.CharField(max_length=200)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pincode = models.CharField(max_length=10)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS, default='pending')
    is_featured = models.BooleanField(default=False)
    views_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Properties'

    def __str__(self):
        return self.title


class PropertyImage(models.Model):
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='properties/')
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-is_primary', 'created_at']


class Amenity(models.Model):
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='amenities')
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class Favorite(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='favorites')
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='favorited_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'property']
