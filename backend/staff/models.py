# Create your models here.
from django.db import models
from django.conf import settings

class StaffProfile(models.Model):
    # Link to user account (like client.user)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="staff_profile",
        null=True,
        blank=True
    )
    
    # Personal Information
    employee_id = models.CharField(max_length=50, unique=True)
    full_name = models.CharField(max_length=255)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=20, choices=[
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other')
    ])
    phone_number = models.CharField(max_length=20)
    email = models.EmailField()
    address = models.TextField()
    
    # Professional Information
    role = models.CharField(max_length=50, choices=[
        ('nurse', 'Nurse'),
        ('nurse_aid', 'Nurse Aid'),
        ('psychiatric_nurse', 'Psychiatric Nurse'),
        ('psychologist', 'Psychologist'),
        ('social_worker', 'Social Worker'),
        ('occupational_therapist', 'Occupational Therapist'),
        ('counselor', 'Counselor'),
        ('doctor', 'Doctor'),
        ('admin', 'Administrator'),
        ('director', 'Director'),
    ])
    
    # Qualifications
    qualification = models.CharField(max_length=255)
    specialization = models.CharField(max_length=255, blank=True)
    years_of_experience = models.IntegerField(default=0)
    license_number = models.CharField(max_length=100, blank=True)
    
    # Employment Details
    department = models.CharField(max_length=100)
    date_joined = models.DateField()
    employment_status = models.CharField(max_length=50, choices=[
        ('full_time', 'Full Time'),
        ('part_time', 'Part Time'),
        ('contract', 'Contract'),
        ('intern', 'Intern'),
    ], default='full_time')
    
    # Emergency Contact
    emergency_contact_name = models.CharField(max_length=255)
    emergency_contact_phone = models.CharField(max_length=20)
    emergency_contact_relation = models.CharField(max_length=50)
    
    # Files
    profile_picture = models.ImageField(
        upload_to="staff/photos/",
        blank=True,
        null=True
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.full_name} - {self.role} ({self.employee_id})"