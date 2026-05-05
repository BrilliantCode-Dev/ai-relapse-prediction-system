from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

# Import serializers
from .serializers import UserRegistrationSerializer, LoginSerializer
from .models import User


# ============================
# 🔐 USER REGISTRATION VIEW
# ============================
class RegisterView(APIView):
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)

        # Validate incoming data
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "User registered successfully"},
                status=status.HTTP_201_CREATED
            )

        # Return validation errors
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============================
# 🔑 USER LOGIN VIEW
# ============================
class LoginView(APIView):
    def post(self, request):
        """
        Handles user login:
        1. Accepts email & password
        2. Validates credentials via LoginSerializer
        3. Returns user info if successful
        """

        serializer = LoginSerializer(data=request.data)

        if serializer.is_valid():
            # Serializer returns the authenticated user
            user = serializer.validated_data

            return Response(
                {
                    "message": "Login successful",
                    "user": {
                        "id": user.id,
                        "full_name": user.full_name,
                        "email": user.email,
                        "role": user.role,
                    }
                },
                status=status.HTTP_200_OK
            )

        # Invalid credentials
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
