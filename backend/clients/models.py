# from django.db import models

# Create your models here.

from django.db import models
from django.conf import settings
from django.contrib.postgres.fields import ArrayField  
from django.conf import settings


class Client(models.Model):
    
    user = models.OneToOneField(
    settings.AUTH_USER_MODEL,
    on_delete=models.CASCADE,
    related_name="client_profile",
    null=True,
    blank=True
    )

    caregivers = models.ManyToManyField(
        "staff.StaffProfile",
        related_name="assigned_clients",
        blank=True
    )
    
    # =========================
    # Personal Information
    # =========================
    date = models.DateField()
    accountNumber = models.CharField(max_length=100, unique=True)
    fullName = models.CharField(max_length=255)

    dob = models.DateField()
    age = models.PositiveIntegerField()

    maritalStatus = models.CharField(max_length=50)
    address = models.TextField()
    phoneNumber = models.CharField(max_length=20)

    occupation = models.CharField(max_length=100)
    educationStatus = models.CharField(max_length=100)
    religiousAffiliation = models.CharField(max_length=100, blank=True)

    # =========================
    # Medical Information
    # =========================
    counselling = models.BooleanField(null=True)
    counsellingDetails = models.TextField(blank=True)

    hivTested = models.BooleanField(null=True)
    hivDetails = models.TextField(blank=True)

    tbTested = models.BooleanField(null=True)
    tbDetails = models.TextField(blank=True)

    physicalHealthProblems = models.TextField()

    hypertension = models.BooleanField(null=True)
    hypertensionDetails = models.TextField(blank=True)

    rehab = models.BooleanField(null=True)
    rehabHistory = models.TextField(blank=True)

    medicalHistory = models.TextField()
    allergies = models.TextField()

    # =========================
    # Mental & Behavioral Assessment
    # =========================
    substanceAbuseCharacteristics = models.TextField()

    seeThings = models.BooleanField(null=True)
    seeThingsDetails = models.TextField(blank=True)

    hearVoices = models.BooleanField(null=True)
    hearVoicesDetails = models.TextField(blank=True)

    violentTendencies = models.BooleanField(null=True)
    violentTendenciesDetails = models.TextField(blank=True)

    weightLoss = models.BooleanField(null=True)
    weightLossDetails = models.TextField(blank=True)

    needAssistance = models.BooleanField(null=True)
    needAssistanceDetails = models.TextField(blank=True)

    # =========================
    # Files
    # =========================
    patientPicture = models.ImageField(
        upload_to="patients/photos/",
        blank=True,
        null=True
    )

    signature = models.ImageField(
        upload_to="patients/signatures/",
        blank=True,
        null=True
    )

    # =========================
    # Metadata
    # =========================
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.fullName} ({self.accountNumber})"
    

class DailyCheckIn(models.Model):
    # 🔗 Link to your Client (patient)
    client = models.ForeignKey("Client", on_delete=models.CASCADE, related_name="checkins")

    # 😊 Mood
    mood = models.CharField(max_length=20)
    mood_intensity = models.IntegerField()

    # 🔥 Cravings
    had_craving = models.CharField(max_length=5)  # "yes" or "no"
    craving_strength = models.IntegerField(null=True, blank=True)
    craving_duration = models.CharField(max_length=50, null=True, blank=True)
    resisted_craving = models.CharField(max_length=5, null=True, blank=True)

    # ⚠️ Triggers
    had_triggers = models.CharField(max_length=5)  # "yes" or "no"
    triggers = ArrayField(
        models.CharField(max_length=100),
        blank=True,
        default=list
    )

    # 🚶 Behavior
    positive_actions = ArrayField(
        models.CharField(max_length=100),
        blank=True,
        default=list
    )
    isolated = models.CharField(max_length=5)  # "yes" or "no"

    # 🏥 Health
    sleep_hours = models.FloatField()
    stress_level = models.IntegerField()
    energy_level = models.IntegerField()

    # 🧠 Confidence
    confidence = models.IntegerField()

    # 📊 Risk
    risk_score = models.FloatField(null=True, blank=True)
    risk_level = models.CharField(max_length=20, null=True, blank=True)

  
    risk_reasons = models.JSONField(null=True, blank=True)
    

    # 📅 Date
    date = models.DateTimeField()

    # ⏱️ Auto timestamps (VERY useful)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.client} - {self.date} - {self.risk_level}"
    
User = settings.AUTH_USER_MODEL

class JournalEntry(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="journal_entries")
    entry = models.TextField()
    tags = models.JSONField(default=list, blank=True)  # stores ["Happy", "Anxious"]
    date = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} - {self.date}"



class Alert(models.Model):
    client = models.ForeignKey(
        "Client",
        on_delete=models.CASCADE,
        related_name="alerts"
    )

    caregiver = models.ForeignKey(
        "staff.StaffProfile",
        on_delete=models.CASCADE,
        related_name="alerts"
    )

    # 📊 Risk info
    risk_score = models.FloatField()
    risk_level = models.CharField(max_length=20)

    # 🤖 AI output
    prediction = models.TextField()
    reasons = models.JSONField(default=list, blank=True)

    # 🔗 Optional: link to the check-in that triggered this
    checkin = models.ForeignKey(
        "DailyCheckIn",
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.client.fullName} - {self.risk_level}"
