from django.urls import path
from .views import (
    StaffProfileView, 
    StaffListView, 
    StaffCreateView,
    StaffDetailView
)
from .views import LinkStaffToUserView


urlpatterns = [
    path('profile/', StaffProfileView.as_view(), name='staff-profile'),
    path('', StaffListView.as_view(), name='staff-list'),
    path('create/', StaffCreateView.as_view(), name='staff-create'),
    path('<int:pk>/', StaffDetailView.as_view(), name='staff-detail'),
    path('link-user/', LinkStaffToUserView.as_view()),
    
]