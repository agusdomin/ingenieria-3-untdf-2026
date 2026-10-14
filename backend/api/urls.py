from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .viewsets import (
    UsuarioViewSet,
    PlanSalidaViewSet,
    ObservacionViewSet,
    ReporteTecnicoViewSet,
    ValoracionViewSet,
    DatosMeteorologicosViewSet,
)
from .auth_views import (
    LoginView,
    RegisterView,
    MeView,
)

router = DefaultRouter()

router.register(r'usuarios', UsuarioViewSet, basename='usuarios')
router.register(r'planes-salida', PlanSalidaViewSet, basename='planes-salida')
router.register(r'observaciones', ObservacionViewSet, basename='observaciones')
router.register(r'reportes-tecnicos', ReporteTecnicoViewSet, basename='reportes-tecnicos')
router.register(r'valoraciones', ValoracionViewSet, basename='valoraciones')
router.register(r'datos-meteorologicos', DatosMeteorologicosViewSet, basename='datos-meteorologicos')

urlpatterns = [
    # Autenticación
    path('auth/login', LoginView.as_view(), name='auth-login'),
    path('auth/login/', LoginView.as_view(), name='auth-login-slash'),
    path('auth/register', RegisterView.as_view(), name='auth-register'),
    path('auth/register/', RegisterView.as_view(), name='auth-register-slash'),
    path('auth/me', MeView.as_view(), name='auth-me'),
    path('auth/me/', MeView.as_view(), name='auth-me-slash'),

    # Rutas generadas automáticamente por el router para los ViewSets
    path('', include(router.urls)),
]