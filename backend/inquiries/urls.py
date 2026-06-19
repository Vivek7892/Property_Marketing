from django.urls import path
from . import views

urlpatterns = [
    path('', views.InquiryCreateView.as_view()),
    path('sent/', views.BuyerInquiryListView.as_view()),
    path('received/', views.SellerInquiryListView.as_view()),
    path('<int:pk>/respond/', views.InquiryRespondView.as_view()),
]
