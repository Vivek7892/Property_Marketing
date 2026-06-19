from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, OTPVerification


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'full_name', 'user_type', 'is_verified', 'is_active', 'created_at']
    list_filter = ['user_type', 'is_verified', 'is_active']
    search_fields = ['email', 'full_name', 'mobile']
    ordering = ['-created_at']
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('full_name', 'mobile', 'city', 'state', 'locality', 'bio', 'profile_photo')}),
        ('Permissions', {'fields': ('user_type', 'is_verified', 'is_active', 'is_staff', 'is_superuser')}),
    )
    add_fieldsets = (
        (None, {'fields': ('email', 'full_name', 'password1', 'password2', 'user_type')}),
    )


@admin.register(OTPVerification)
class OTPAdmin(admin.ModelAdmin):
    list_display = ['user', 'purpose', 'is_used', 'created_at']
