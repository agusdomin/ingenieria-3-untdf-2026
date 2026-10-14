from rest_framework import permissions
from django.contrib.auth import get_user_model

Usuario = get_user_model()


class IsOwnerOrAdminOrReadOnly(permissions.BasePermission):
    """
    Permiso para recursos generales (Observaciones, Planes de Salida, Valoraciones):
    - Lectura (GET, HEAD, OPTIONS): Pública para cualquier usuario (incluso no autenticado).
    - Creación (POST): Requiere estar autenticado.
    - Modificación / Eliminación (PUT, PATCH, DELETE): Solo el autor original o un administrador.
    """

    def has_permission(self, request, view):
        # Permite métodos seguros (GET, HEAD, OPTIONS) a cualquiera
        if request.method in permissions.SAFE_METHODS:
            return True
        # Para cualquier método de escritura se requiere estar autenticado
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        # Lectura abierta a nivel de objeto
        if request.method in permissions.SAFE_METHODS:
            return True

        if not request.user or not request.user.is_authenticated:
            return False

        # Administradores / staff pueden editar o borrar cualquier objeto
        if request.user.is_staff or request.user.is_superuser:
            return True

        # Verifica si el objeto tiene atributo 'usuario' (o si el objeto mismo es el Usuario)
        owner = getattr(obj, 'usuario', None)
        if owner is not None:
            return owner == request.user

        return obj == request.user


class IsExpertoOwnerOrAdminOrReadOnly(permissions.BasePermission):
    """
    Permiso específico para Reportes Técnicos:
    - Lectura (GET, HEAD, OPTIONS): Pública para cualquiera.
    - Creación (POST): Solo usuarios autenticados con rol 'experto' o administradores.
    - Modificación / Eliminación (PUT, PATCH, DELETE): Solo el experto que lo creó o un administrador.
    """

    def has_permission(self, request, view):
        # Lectura libre para cualquiera
        if request.method in permissions.SAFE_METHODS:
            return True

        # Para crear se requiere estar autenticado y ser Experto o Admin
        if not request.user or not request.user.is_authenticated:
            return False

        if request.user.is_staff or request.user.is_superuser:
            return True

        return getattr(request.user, 'rol', None) == Usuario.Rol.EXPERTO

    def has_object_permission(self, request, view, obj):
        # Lectura libre
        if request.method in permissions.SAFE_METHODS:
            return True

        if not request.user or not request.user.is_authenticated:
            return False

        # Administradores pueden editar o borrar cualquier reporte
        if request.user.is_staff or request.user.is_superuser:
            return True

        # Solo el experto creador puede editar o borrar su propio reporte
        owner = getattr(obj, 'usuario', None)
        return owner == request.user

