from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")

        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)   # 🔐 hashes password
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('director', 'Director'),
        ('staff', 'Staff'),
        ('nurse', 'Nurse'),
        ('patient', 'Patient'),
        ('social-worker', 'Social Worker'),
        ('counsellor', 'Counsellor'),
        ('psychologist', 'Psychologist'),
        ('occupational-therapist', 'Occupational Therapist'),
        ('nurse-aid', 'Nurse Aid'),
        ('psychiatrist', 'Psychiatrist'),
        ('family-therapist', 'Family Therapist'),
    )

    full_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)
    role = models.CharField(max_length=30, choices=ROLE_CHOICES)  # ← Changed from 20 to 30
    account_number = models.CharField(max_length=100, null=True, blank=True)
    employee_number = models.CharField(max_length=50, null=True, blank=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email