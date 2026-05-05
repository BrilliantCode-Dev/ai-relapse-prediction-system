from rest_framework import serializers
from .models import Client
from patients.models import User
from .models import DailyCheckIn
from .models import JournalEntry
from staff.serializers import StaffProfileSerializer

class ClientSerializer(serializers.ModelSerializer):
    caregivers = StaffProfileSerializer(many=True, read_only=True)

    class Meta:
        model = Client
        fields = "__all__"



class PatientAccountSerializer(serializers.Serializer):

    accountNumber = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def create(self, validated_data):

        account_number = validated_data["accountNumber"]
        email = validated_data["email"]
        password = validated_data["password"]

        # Find the patient record
        try:
            client = Client.objects.get(accountNumber=account_number)
        except Client.DoesNotExist:
            raise serializers.ValidationError("Invalid account number")

        # Check if patient already has an account
        if client.user:
            raise serializers.ValidationError("This patient already has an account")

        # Create user account
        user = User.objects.create_user(
            email=email,
            password=password,
            full_name=client.fullName,
            role="patient"
        )

        # Link the patient record
        client.user = user
        client.save()

        return user
    
class DailyCheckInSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyCheckIn
        fields = "__all__"
        read_only_fields = ["client", "created_at"]

class JournalEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = JournalEntry
        fields = "__all__"
        read_only_fields = ["user", "created_at"]



