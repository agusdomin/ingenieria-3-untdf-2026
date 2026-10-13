from rest_framework import status, serializers
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate, get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

Usuario = get_user_model()


def serialize_user_for_frontend(user) -> dict:
    if user.is_superuser or user.is_staff:
        role = 'administrador'
    elif user.rol == Usuario.Rol.EXPERTO:
        role = 'observador_experto'
    else:
        role = 'observador_recreativo'

    return {
        'id': str(user.id),
        'firstName': user.first_name or user.nombre or '',
        'lastName': user.last_name or '',
        'email': user.email,
        'role': role,
    }


def get_auth_response(user) -> dict:
    refresh = RefreshToken.for_user(user)
    return {
        'accessToken': str(refresh.access_token),
        'refreshToken': str(refresh),
        'user': serialize_user_for_frontend(user),
    }


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class RegisterSerializer(serializers.Serializer):
    firstName = serializers.CharField(max_length=150)
    lastName = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)

    def validate_email(self, value):
        if Usuario.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Ya existe un usuario con este email.")
        return value.lower()


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email'].lower()
        password = serializer.validated_data['password']

        user_obj = Usuario.objects.filter(email__iexact=email).first()
        if not user_obj:
            return Response(
                {'detail': 'Credenciales inválidas.'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        user = authenticate(request, username=user_obj.username, password=password)
        if not user:
            return Response(
                {'detail': 'Credenciales inválidas.'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        return Response(get_auth_response(user), status=status.HTTP_200_OK)


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        email = data['email']
        first_name = data['firstName']
        last_name = data['lastName']

        user = Usuario.objects.create_user(
            username=email,
            email=email,
            password=data['password'],
            first_name=first_name,
            last_name=last_name,
            nombre=f"{first_name} {last_name}".strip(),
            rol=Usuario.Rol.COMUN,
        )

        return Response(get_auth_response(user), status=status.HTTP_201_CREATED)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(
            serialize_user_for_frontend(request.user),
            status=status.HTTP_200_OK
        )