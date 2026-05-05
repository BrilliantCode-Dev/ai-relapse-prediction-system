from rest_framework import serializers
from .models import StaffProfile

class StaffProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = StaffProfile
        fields = [
            "id",
            "employee_id",
            "full_name",
            "date_of_birth",
            "gender",
            "phone_number",
            "email",
            "address",
            "role",
            "qualification",
            "specialization",
            "years_of_experience",
            "license_number",
            "department",
            "date_joined",
            "employment_status",
            "emergency_contact_name",
            "emergency_contact_phone",
            "emergency_contact_relation",
            "profile_picture",
            "user"
        ]

class StaffRegistrationSerializer(serializers.Serializer):
    employee_id = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    full_name = serializers.CharField()
    role = serializers.CharField()
    phone_number = serializers.CharField()
    date_of_birth = serializers.DateField()
    # ... add all other fields you need

