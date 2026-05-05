from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from clients.models import Client  # Add this import at the top
# JWT imports (NEW)
from rest_framework_simplejwt.views import TokenObtainPairView

# Import serializers
from .serializers import (
    UserRegistrationSerializer,
    LoginSerializer,
    CustomTokenObtainPairSerializer,  # NEW
)
from .models import User


# ============================
# 🔐 USER REGISTRATION VIEW (UPDATED WITH STAFF SUPPORT)
# ============================
class RegisterView(APIView):
    def post(self, request):
        # Get role from request
        role = request.data.get('role')
        account_number = request.data.get('account_number')
        
        # Check if this is a patient registration
        if role == 'patient':
            if not account_number:
                return Response(
                    {"error": "Account number is required for patients"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Verify account number exists in clients table
            try:
                client = Client.objects.get(accountNumber=account_number)
            except Client.DoesNotExist:
                return Response(
                    {"error": "Invalid account number. No patient found with this account number."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if this client already has a user account
            if client.user:
                return Response(
                    {"error": "This patient already has an account"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Verify the name matches
            if client.fullName != request.data.get('full_name'):
                return Response(
                    {"error": "Name does not match the account number"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # NEW: Check if this is a staff registration
        elif role in [
            "staff", "nurse", "social-worker", "family-therapist",
            "psychiatrist", "nurse-aid", "psychologist",
            "counsellor", "occupational-therapist"
        ]:
            employee_id = request.data.get("employee_number")
            
            if not employee_id:
                return Response(
                    {"error": "Employee ID is required for staff members"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Import StaffProfile model
            from staff.models import StaffProfile
            
            try:
                staff = StaffProfile.objects.get(employee_id=employee_id)
            except StaffProfile.DoesNotExist:
                return Response(
                    {"error": "Invalid employee ID. No staff member found with this employee ID."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # 🚨 Prevent duplicate accounts
            if staff.user:
                return Response(
                    {"error": "This staff member already has an account"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Verify the name matches
            if staff.full_name != request.data.get('full_name'):
                return Response(
                    {"error": "Name does not match the employee ID"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Prepare data for serializer
        data = request.data.copy()
        
        # Ensure account_number is included in the data for patients
        if role == 'patient' and account_number:
            data['account_number'] = account_number
        
        # Ensure employee_number is included for staff
        if role in [
            "staff", "nurse", "social-worker", "family-therapist",
            "psychiatrist", "nurse-aid", "psychologist",
            "counsellor", "occupational-therapist"
        ] and employee_id:
            data['employee_number'] = employee_id
        
        # Proceed with normal registration
        serializer = UserRegistrationSerializer(data=data)

        if serializer.is_valid():
            # This will call the serializer's create method
            user = serializer.save()
            
            # Link the appropriate profile based on role
            if role == 'patient':
                # Refresh user from database to ensure we have latest data
                user.refresh_from_db()
                
                # Link the client record to the user
                client.user = user
                client.save()
                
                print(f"✅ Patient registered: {user.full_name}")
                print(f"✅ Account number saved: {user.account_number}")
                print(f"✅ Client linked: {client.fullName}")
            
            elif role in [
                "staff", "nurse", "social-worker", "family-therapist",
                "psychiatrist", "nurse-aid", "psychologist",
                "counsellor", "occupational-therapist"
            ]:
                # Refresh user from database
                user.refresh_from_db()
                
                # 🔥 STEP 5: Save employee_id in User model (IMPORTANT)
                user.employee_number = employee_id
                user.save()
                
                # 🔥 STEP 6: Link StaffProfile to User
                staff.user = user
                staff.save()
                
                print(f"✅ Staff registered: {user.full_name}")
                print(f"✅ Employee ID saved in User: {user.employee_number}")
                print(f"✅ Staff profile linked: {staff.full_name} (Role: {staff.role})")
            
            # Prepare response data
            response_data = {
                "message": "User registered successfully",
                "user": {
                    "id": user.id,
                    "full_name": user.full_name,
                    "email": user.email,
                    "role": user.role,
                }
            }
            
            # Include account_number if it exists
            if hasattr(user, 'account_number') and user.account_number:
                response_data["user"]["account_number"] = user.account_number
            
            # Include employee_number if it exists
            if hasattr(user, 'employee_number') and user.employee_number:
                response_data["user"]["employee_number"] = user.employee_number
            
            return Response(response_data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============================
# 🔑 USER LOGIN VIEW (LEGACY / OPTIONAL)
# ============================
class LoginView(APIView):
    """
    Legacy login:
    - Email + password
    - Returns user info
    - DOES NOT return JWT
    """

    def post(self, request):
        serializer = LoginSerializer(data=request.data)

        if serializer.is_valid():
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

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============================
# 🔐 JWT LOGIN VIEW (NEW, SAFE)
# ============================
class CustomTokenObtainPairView(TokenObtainPairView):
    """
    JWT login endpoint:
    - Accepts email + password
    - Returns access & refresh tokens
    - Includes full_name & role in JWT
    """
    serializer_class = CustomTokenObtainPairSerializer