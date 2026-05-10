from django.urls import path
from .views import ClientCreateView, PatientAccountCreateView, PatientProfileView, ClientListView
from .views import DailyCheckInCreateView, DailyCheckInListView
from .views import JournalEntryCreateView
from .views import AssignCaregiverView
from .views import MyPatientsView
from .views import AlertsView
from .views import chat
from .views import AIAlertsView

urlpatterns = [
    # For listing all clients (GET) and creating new clients (POST)
    path("", ClientListView.as_view(), name="client-list"),  # Add this for GET requests
    path("create/", ClientCreateView.as_view(), name="create-client"),  # Move POST to /create/
    path("create-account/", PatientAccountCreateView.as_view(), name="patient-create-account"),
    path("profile/", PatientProfileView.as_view(), name="patient-profile"),
    path("checkin/", DailyCheckInCreateView.as_view(), name="create-checkin"),
    path("checkin/history/", DailyCheckInListView.as_view(), name="checkin-history"),
    path('journal/', JournalEntryCreateView.as_view(), name='journal-entries'),
    path("assign-caregiver/", AssignCaregiverView.as_view()),
    path("my-patients/", MyPatientsView.as_view()),
    path("alerts/", AlertsView.as_view(), name="alerts"),
    path("chat/", chat),
    path("ai-alerts/", AIAlertsView.as_view()),
]