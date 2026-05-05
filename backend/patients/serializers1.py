from rest_framework import serializers
from .models import User

from django.contrib.auth.hashers import make_password, check_password

# JWT imports
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


# ============================
# 🔐 USER REGISTRATION SERIALIZER
# ============================
class UserRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['full_name', 'email', 'phone', 'role', 'password']

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists")
        return value

    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])
        return User.objects.create(**validated_data)


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
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom JWT serializer that:
    - Authenticates using email
    - Injects full_name & role into JWT
    """

    username_field = 'email'  # 🔥 VERY IMPORTANT

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Custom claims
        token['full_name'] = user.full_name
        token['role'] = user.role
        token['email'] = user.email

        return token
