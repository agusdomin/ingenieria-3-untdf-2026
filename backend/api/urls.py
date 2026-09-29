from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .viewsets import (
    UsuarioViewSet,
    ZonaViewSet,
    PlanSalidaViewSet,
    ObservacionViewSet,
    ReporteTecnicoViewSet,
    ValoracionViewSet,
    DatosMeteorologicosViewSet,
)
# from .views import (
#     CustomTokenObtainPairView,
#     CustomTokenRefreshView,
#     LogoutView,
# )

router = DefaultRouter()

router.register(r'usuarios', UsuarioViewSet, basename='usuarios')
router.register(r'zonas', ZonaViewSet, basename='zonas')
router.register(r'planes-salida', PlanSalidaViewSet, basename='planes-salida')
router.register(r'observaciones', ObservacionViewSet, basename='observaciones')
router.register(r'reportes-tecnicos', ReporteTecnicoViewSet, basename='reportes-tecnicos')
router.register(r'valoraciones', ValoracionViewSet, basename='valoraciones')
router.register(r'datos-meteorologicos', DatosMeteorologicosViewSet, basename='datos-meteorologicos')

urlpatterns = [
    # Autenticación (descomentar al implementar views.py)
    # path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    # path('auth/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    # path('auth/logout/', LogoutView.as_view(), name='logout'),

    # Rutas generadas automáticamente por el router para los ViewSets
    path('', include(router.urls)),
]
