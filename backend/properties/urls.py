from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'listings', views.PropertyViewSet, basename='property')
router.register(r'admin', views.AdminPropertyViewSet, basename='admin-property')

urlpatterns = [
    path('', include(router.urls)),
    path('images/<int:pk>/delete/', views.PropertyImageDeleteView.as_view()),
    path('favorites/', views.FavoriteListView.as_view()),
    path('<uuid:pk>/favorite/', views.ToggleFavoriteView.as_view()),
]
