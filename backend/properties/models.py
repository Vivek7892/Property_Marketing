from django.db import models
from django.conf import settings
import uuid


class Property(models.Model):
    PROPERTY_TYPES = [
        ('house', 'House'),
        ('shop',  'Shop'),
        ('site',  'Site/Plot'),
    ]
    CATEGORIES = [('sale', 'Sale'), ('rent', 'Rent'), ('lease', 'Lease')]
    FURNISHED  = [('unfurnished', 'Unfurnished'), ('semi', 'Semi-Furnished'), ('furnished', 'Furnished')]
    STATUS     = [('pending', 'Pending'), ('approved', 'Approved'), ('rejected', 'Rejected'), ('sold', 'Sold')]
    FACING     = [('east', 'East'), ('west', 'West'), ('north', 'North'), ('south', 'South'),
                  ('north_east', 'North East'), ('north_west', 'North West'),
                  ('south_east', 'South East'), ('south_west', 'South West')]

    # ── Core ──────────────────────────────────────────────────
    id            = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner         = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='properties')
    title         = models.CharField(max_length=300)
    description   = models.TextField()
    property_type = models.CharField(max_length=10, choices=PROPERTY_TYPES)
    category      = models.CharField(max_length=10, choices=CATEGORIES)
    price         = models.DecimalField(max_digits=15, decimal_places=2)
    is_negotiable = models.BooleanField(default=False)
    area_sqft     = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    # ── Location ──────────────────────────────────────────────
    address   = models.TextField()
    locality  = models.CharField(max_length=200)
    city      = models.CharField(max_length=100)
    state     = models.CharField(max_length=100)
    pincode   = models.CharField(max_length=10, blank=True)
    latitude  = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    map_url   = models.URLField(max_length=500, blank=True)
    facing    = models.CharField(max_length=15, choices=FACING, blank=True)

    # ── HOUSE specific ────────────────────────────────────────
    bedrooms         = models.PositiveSmallIntegerField(default=0)
    bathrooms        = models.PositiveSmallIntegerField(default=0)
    balconies        = models.PositiveSmallIntegerField(default=0)
    floors           = models.PositiveSmallIntegerField(default=1)
    floor_number     = models.PositiveSmallIntegerField(null=True, blank=True)   # which floor (for apartment)
    parking          = models.BooleanField(default=False)
    furnished_status = models.CharField(max_length=15, choices=FURNISHED, default='unfurnished', blank=True)
    water_supply     = models.BooleanField(default=False)
    power_backup     = models.BooleanField(default=False)
    lift             = models.BooleanField(default=False)

    # ── SHOP specific ─────────────────────────────────────────
    shop_frontage_ft  = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)  # frontage in ft
    shop_depth_ft     = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    floor_type        = models.CharField(max_length=100, blank=True)   # marble, tiles, etc.
    washroom          = models.BooleanField(default=False)
    display_window    = models.BooleanField(default=False)
    pantry            = models.BooleanField(default=False)
    current_load_kw   = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)  # electrical load

    # ── SITE specific ─────────────────────────────────────────
    plot_length_ft    = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    plot_width_ft     = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    road_width_ft     = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    is_corner_plot    = models.BooleanField(default=False)
    is_gated          = models.BooleanField(default=False)
    approval_type     = models.CharField(max_length=100, blank=True)   # BMRDA, BBMP, Panchayat, etc.
    conversion_done   = models.BooleanField(default=False)             # DC conversion

    # ── Financial (Rent/Lease) ────────────────────────────────
    advance_amount    = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    maintenance_fee   = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    rent_includes     = models.CharField(max_length=200, blank=True)   # water, electricity, etc.
    lease_years       = models.PositiveSmallIntegerField(null=True, blank=True)

    # ── Meta ──────────────────────────────────────────────────
    status      = models.CharField(max_length=10, choices=STATUS, default='pending')
    is_featured = models.BooleanField(default=False)
    views_count = models.PositiveIntegerField(default=0)
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Properties'

    def __str__(self):
        return self.title


class PropertyImage(models.Model):
    property   = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='images')
    image      = models.TextField()          # Cloudinary secure_url
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-is_primary', 'created_at']


class Amenity(models.Model):
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='amenities')
    name     = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class Favorite(models.Model):
    user     = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='favorites')
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='favorited_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'property']
