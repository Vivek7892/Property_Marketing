from django.urls import path
from . import views

urlpatterns = [
    path('', views.NotificationListView.as_view()),
    path('mark-read/', views.MarkAllReadView.as_view()),
    path('unread-count/', views.UnreadCountView.as_view()),
]
