from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Client
from .serializers import ClientSerializer
from .serializers import PatientAccountSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics, permissions
from .models import DailyCheckIn, Client
from .serializers import DailyCheckInSerializer
from .models import JournalEntry
from .serializers import JournalEntrySerializer
from rest_framework import serializers  # add this at top if missing
from .utils import predict_risk
from staff.models import StaffProfile
from .models import Alert
from rest_framework.response import Response
from django.conf import settings
from rest_framework.permissions import AllowAny
from rest_framework.decorators import api_view, permission_classes
from google import genai

gemini_client = genai.Client(api_key=settings.GEMINI_API_KEY)

class MyPatientsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        try:
            staff_profile = user.staff_profile
        except:
            return Response({"error": "Not a staff user"}, status=400)

        # Get patients assigned to this staff
        patients = Client.objects.filter(caregivers=staff_profile)

        serializer = ClientSerializer(patients, many=True)
        return Response(serializer.data)


class ClientListView(APIView):
    """
    GET: List all clients (patients)
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        clients = Client.objects.all().order_by('-created_at')  # Latest first
        serializer = ClientSerializer(clients, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class ClientCreateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = ClientSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


    
class PatientAccountCreateView(APIView):

    def post(self, request):

        serializer = PatientAccountSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()

            return Response(
                {"message": "Patient account created successfully"},
                status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class PatientProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Get account_number from the logged-in user
            # Assuming you've added account_number to your User model
            account_number = request.user.account_number
            
            if not account_number:
                return Response(
                    {"error": "No account number linked to this user"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Find client by account number instead of user ID
            client = Client.objects.get(accountNumber=account_number)
            serializer = ClientSerializer(client)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Client.DoesNotExist:
            return Response(
                {"error": "Patient profile not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
class DailyCheckInCreateView(generics.CreateAPIView):
    serializer_class = DailyCheckInSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        user = request.user

        try:
            client = Client.objects.get(user=user)
        except Client.DoesNotExist:
            return Response({"error": "Client not found"}, status=400)

        data = request.data.copy()

        # 🔥 RUN MODEL
        result = predict_risk(data)

        print("🔥 MODEL RESULT:", result)

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)

        checkin = serializer.save(
            client=client,
            risk_level=result["risk"],
            risk_score=result["risk_score"],
            risk_reasons=result["reasons"]
        )

        # 🚨 ONLY create alert if high risk
        if result["risk"] == "High Risk":
            caregivers = client.caregivers.all()

            for caregiver in caregivers:
                Alert.objects.create(
                    client=client,
                    caregiver=caregiver,
                    risk_score=result["risk_score"],
                    risk_level=result["risk"],
                    prediction=result["prediction_text"],
                    reasons=result["reasons"],
                    checkin=checkin
                )

        # ✅ SEND RESPONSE BACK TO FRONTEND
        return Response(result, status=201)
            
class DailyCheckInListView(generics.ListAPIView):
    serializer_class = DailyCheckInSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return DailyCheckIn.objects.filter(client__user=user).order_by("-date")
    
class JournalEntryCreateView(generics.ListCreateAPIView):
    serializer_class = JournalEntrySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return JournalEntry.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class AssignCaregiverView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        client_id = request.data.get("client_id")
        caregiver_id = request.data.get("caregiver_id")

        try:
            client = Client.objects.get(id=client_id)
            caregiver = StaffProfile.objects.get(id=caregiver_id)

            # Optional: restrict to certain roles
            ALLOWED_ROLES = [
                "social_worker",
                "psychologist",
                "psychiatric_nurse",
                "counselor",
            ]

            if caregiver.role not in ALLOWED_ROLES:
                return Response({"error": "Invalid caregiver role"}, status=400)

            client.caregivers.add(caregiver)

            return Response({"message": "Caregiver assigned successfully"})

        except Client.DoesNotExist:
            return Response({"error": "Client not found"}, status=404)

        except StaffProfile.DoesNotExist:
            return Response({"error": "Caregiver not found"}, status=404)
        
class AlertsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        try:
            staff_profile = user.staff_profile
        except:
            return Response({"error": "Not a staff user"}, status=400)

        # Get alerts for this caregiver
        alerts = Alert.objects.filter(caregiver=staff_profile).order_by("-created_at")

        data = []
        for alert in alerts:
            data.append({
                
                "patient_name": alert.client.fullName,
                "risk_score": alert.risk_score,
                "risk_level": alert.risk_level,
                "prediction": alert.prediction,
                "reasons": alert.reasons,
                "created_at": alert.created_at,
            })

        return Response(data)

client = genai.Client()


    















    
client = genai.Client(api_key=settings.GEMINI_API_KEY)

SYSTEM_PROMPT = """
You are a supportive mental health assistant for patients recovering from substance abuse.

Rules:
- Be empathetic and calm
- Keep responses SHORT (2–4 sentences max)
- Be conversational, not formal
- Encourage small positive actions
- Do NOT give medical advice
- Do NOT diagnose
- If the user expresses distress, suggest contacting a social worker briefly
"""

HIGH_RISK_WORDS = ["relapse", "craving", "using again", "can't stop"]

def detect_risk(message):
    message = message.lower()
    return any(word in message for word in HIGH_RISK_WORDS)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def chat(request):
    user_message = request.data.get("message")

    if not user_message:
        return Response({"error": "Message is required"}, status=400)

    # ✅ get patient
    try:
        patient = Client.objects.get(user=request.user)
    except Client.DoesNotExist:
        return Response({"error": "Client not found"}, status=404)

    # ✅ risk detection
    risk = detect_risk(user_message)

    prompt = SYSTEM_PROMPT + "\nUser: " + user_message

    try:
        response = client.models.generate_content(
        model="gemini-3-flash-preview",
        contents=[
            {
                "role": "user",
                "parts": [{"text": prompt}]
            }
        ],
    )

        bot_reply = response.text

    except Exception as e:
        print("Gemini error:", str(e))
        return Response({
            "reply": "I'm a bit busy right now, try again 😊",
            "risk": False
        })

    # ✅ alerts
    if risk:
        caregivers = patient.caregivers.all()

        for caregiver in caregivers:
            Alert.objects.create(
                client=patient,
                caregiver=caregiver,
                risk_score=8,
                risk_level="HIGH",
                prediction="Distress detected from chat",
                reasons=[user_message]
            )

    return Response({
        "reply": bot_reply,
        "risk": risk
    })