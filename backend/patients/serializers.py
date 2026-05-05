from rest_framework import serializers
from .models import User

from django.contrib.auth.hashers import make_password, check_password

# JWT imports
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    account_number = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = User
        fields = ('id', 'full_name', 'email', 'password', 'role', 'phone', 'account_number')

    def create(self, validated_data):
        # Extract account_number if present
        account_number = validated_data.pop('account_number', None)
        
        # Create user with all other fields
        user = User.objects.create_user(**validated_data)
        
        # Save account_number if provided
        if account_number:
            user.account_number = account_number
            user.save(update_fields=['account_number'])
            print(f"✅ Account number {account_number} saved for user {user.email}")
        
        return user

# ============================
# 🔑 USER LOGIN SERIALIZER (legacy / optional)
# ============================
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, data):
        try:
            user = User.objects.get(email=data['email'])
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid email or password")

        if not check_password(data['password'], user.password):
            raise serializers.ValidationError("Invalid email or password")

        return user


# ============================
# 🔐 JWT TOKEN SERIALIZER (NEW)
# ============================
# class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom JWT serializer that:
    - Authenticates using email
    - Injects full_name & role into JWT
    - Returns them in login response
    """

    username_field = "email"

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom fields to token
        token["full_name"] = user.full_name
        token["role"] = user.role
        token["email"] = user.email

        return token

    def validate(self, attrs):
        data = super().validate(attrs)

        # Add extra data to login response
        data["full_name"] = self.user.full_name
        data["role"] = self.user.role
        data["email"] = self.user.email

        return data