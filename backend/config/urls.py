from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

urlpatterns = [
    path('', lambda request: JsonResponse({'status': 'ok', 'message': 'API is running'})),
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/properties/', include('properties.urls')),
    path('api/chat/', include('chat.urls')),
    path('api/inquiries/', include('inquiries.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/admin-panel/', include('admin_api.urls')),
]
