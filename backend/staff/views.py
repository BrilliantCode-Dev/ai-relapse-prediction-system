from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import StaffProfile
from .serializers import StaffProfileSerializer

# FIXED: Import User from the correct location
# If your User model is in patients app, keep it, otherwise change:
try:
    from patients.models import User
except ImportError:
    from django.contrib.auth import get_user_model
    User = get_user_model()


class StaffProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            # Get staff profile by user
            profile = StaffProfile.objects.get(user=request.user)
            
            # IMPORTANT: Return more comprehensive data for the dashboard
            serializer = StaffProfileSerializer(profile)
            
            # Add user data to response
            data = serializer.data
            data['user_email'] = request.user.email
            data['user_full_name'] = request.user.full_name
            
            return Response(data)
            
        except StaffProfile.DoesNotExist:
            return Response(
                {"error": "Staff profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )


class StaffListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # ✅ Directors/Admins see ALL staff
        if request.user.role in ['director', 'admin']:
            staff = StaffProfile.objects.all()
        else:
            # Optional: staff see only themselves or limited view
            staff = StaffProfile.objects.filter(user=request.user)
        
        data = [
            {
                "id": s.id,
                "employee_id": s.employee_id,
                "full_name": s.full_name,
                "email": s.email,
                "phone_number": s.phone_number,
                "role": s.role,
                "department": s.department,  # ✅ ADD THIS
                "employment_status": s.employment_status,  # ✅ ADD THIS
                "user": s.user.id if s.user else None
            }
            for s in staff
        ]
        
        return Response(data)

class StaffCreateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        # Only directors and admins can create staff profiles
        if request.user.role not in ['director', 'admin']:
            return Response(
                {"error": "Permission denied"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = StaffProfileSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class StaffDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        try:
            staff = StaffProfile.objects.get(pk=pk)
            
            # Check permission: staff can view their own, directors can view all
            if request.user.role not in ['director', 'admin'] and staff.user != request.user:
                return Response(
                    {"error": "Permission denied"},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            serializer = StaffProfileSerializer(staff)
            return Response(serializer.data)
            
        except StaffProfile.DoesNotExist:
            return Response(
                {"error": "Staff not found"},
                status=status.HTTP_404_NOT_FOUND
            )


class LinkStaffToUserView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        employee_id = request.data.get('employee_id')
        email = request.data.get('email')
        password = request.data.get('password')
        
        # Add validation
        if not employee_id:
            return Response(
                {"error": "Employee ID is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Find staff profile
            staff = StaffProfile.objects.get(employee_id=employee_id)
            
            # Check if already linked
            if staff.user:
                return Response(
                    {"error": "Staff already has a user account"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if email already exists
            if User.objects.filter(email=email).exists():
                return Response(
                    {"error": "Email already registered"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create user account
            user = User.objects.create_user(
                email=email,
                password=password,
                full_name=staff.full_name,
                role=staff.role
            )
            
            # Link staff profile to user
            staff.user = user
            staff.save()
            
            return Response({
                "message": "Staff user account created successfully",
                "staff_id": staff.id,
                "user_id": user.id,
                "employee_id": staff.employee_id,
                "full_name": staff.full_name
            })
            
        except StaffProfile.DoesNotExist:
            return Response(
                {"error": f"Staff profile not found with employee ID: {employee_id}"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": f"An error occurred: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
class MyClientsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        try:
            staff = user.staff_profile
        except:
            return Response({"error": "Not a staff member"}, status=400)

        clients = staff.assigned_clients.all()

        data = [
            {
                "id": c.id,
                "name": c.fullName,
                "account": c.accountNumber,
            }
            for c in clients
        ]

        return Response(data)