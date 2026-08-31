from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from .serializers import UserSerializer, RegisterSerializer, AgentCreateSerializer, EmailTokenObtainPairSerializer
from .models import Company
from .permissions import IsManager
from rest_framework_simplejwt.views import TokenObtainPairView

User = get_user_model()


class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"message": "Registration successful."}, status=201)


class ProfileView(APIView):
    def get(self, request):
        return Response(UserSerializer(request.user, context={"request": request}).data)

    def put(self, request):
        user = request.user
        data = request.data
        if "first_name" in data:
            user.first_name = data["first_name"]
        if "last_name" in data:
            user.last_name = data["last_name"]
        if "email" in data:
            user.email = data["email"]
        if "phone" in data:
            user.phone = data["phone"]
        if "avatar" in data:
            user.avatar = data["avatar"]
        user.save()
        return Response(UserSerializer(user, context={"request": request}).data)


class AgentViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [IsManager]

    def get_queryset(self):
        return User.objects.filter(
            company=self.request.user.company,
            role="AGENT",
        )

    def create(self, request, *args, **kwargs):
        serializer = AgentCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        agent = User.objects.create_user(
            username=data["username"],
            email=data["email"],
            password=data["password"],
            first_name=data.get("first_name", ""),
            last_name=data.get("last_name", ""),
            phone=data.get("phone", ""),
            company=request.user.company,
            role="AGENT",
        )
        return Response(UserSerializer(agent, context={"request": request}).data, status=201)

    def update(self, request, *args, **kwargs):
        agent = self.get_object()
        data = request.data
        if "first_name" in data:
            agent.first_name = data["first_name"]
        if "last_name" in data:
            agent.last_name = data["last_name"]
        if "email" in data:
            agent.email = data["email"]
        if "phone" in data:
            agent.phone = data["phone"]
        if "avatar" in data:
            agent.avatar = data["avatar"]
        agent.save()
        return Response(UserSerializer(agent, context={"request": request}).data)

    def destroy(self, request, *args, **kwargs):
        agent = self.get_object()
        agent.delete()
        return Response(status=204)


class SettingsView(APIView):
    def get(self, request):
        user = request.user
        return Response({
            "user": UserSerializer(user, context={"request": request}).data,
            "company": {
                "id": user.company.id if user.company else None,
                "name": user.company.name if user.company else "",
            },
        })

    def put(self, request):
        user = request.user
        data = request.data
        if "first_name" in data:
            user.first_name = data["first_name"]
        if "last_name" in data:
            user.last_name = data["last_name"]
        if "email" in data:
            user.email = data["email"]
        if "phone" in data:
            user.phone = data["phone"]
        if "avatar" in data:
            user.avatar = data["avatar"]
        user.save()
        return Response(UserSerializer(user, context={"request": request}).data)


class ChangePasswordView(APIView):
    def post(self, request):
        user = request.user
        old_password = request.data.get("old_password")
        new_password = request.data.get("new_password")
        if not user.check_password(old_password):
            return Response({"error": "Wrong password"}, status=400)
        user.set_password(new_password)
        user.save()
        return Response({"message": "Password changed"})


class SwitchAccountView(APIView):
    def post(self, request):
        user = request.user
        target_user_id = request.data.get("user_id")
        if user.role != "MANAGER":
            return Response({"error": "Only managers can switch"}, status=403)
        try:
            target = User.objects.get(id=target_user_id, company=user.company)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(target)
        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": UserSerializer(target, context={"request": request}).data,
        })


class TeamMembersView(APIView):
    def get(self, request):
        users = User.objects.filter(company=request.user.company)
        return Response(UserSerializer(users, many=True, context={"request": request}).data)
