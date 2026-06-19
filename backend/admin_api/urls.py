from django.urls import path
from .views import AdminStatsView, AdminUserListView

urlpatterns = [
    path('stats/', AdminStatsView.as_view()),
    path('users/', AdminUserListView.as_view()),
    path('users/<uuid:pk>/', AdminUserListView.as_view()),
]
