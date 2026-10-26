from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from ..models import Usuario
from ..serializer import usuarioSerializer


class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = usuarioSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user or not user.is_authenticated:
            return Usuario.objects.none()
        # Los administradores pueden listar y gestionar a todos los usuarios
        if user.is_staff or user.is_superuser:
            return Usuario.objects.all()
        # Los usuarios comunes solo pueden acceder a su propio perfil
        return Usuario.objects.filter(id=user.id)

    def perform_create(self, serializer):
        # Solo administradores pueden crear usuarios directamente desde este endpoint
        # El público general utiliza el registro abierto (/api/auth/register)
        if not (self.request.user.is_staff or self.request.user.is_superuser):
            raise PermissionDenied("Solo los administradores pueden registrar usuarios desde este endpoint.")
        serializer.save()

    def perform_update(self, serializer):
        # Evita que un usuario regular escale privilegios o se autoasigne rol de experto
        if not (self.request.user.is_staff or self.request.user.is_superuser):
            serializer.save(rol=self.get_object().rol, is_staff=False, is_superuser=False)
        else:
            serializer.save()

    @action(detail=True, methods=['patch', 'post'], permission_classes=[permissions.IsAdminUser])
    def cambiar_rol(self, request, pk=None):
        '''Permitir el cambio de roles'''
        usuario = self.get_object()
        nuevo_rol = request.data.get('rol')

        if not nuevo_rol or nuevo_rol not in Usuario.Rol.values:
            return Response(
                {
                    'detail': f"Rol inválido. Opciones válidas: {Usuario.Rol.values}"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        usuario.rol = nuevo_rol
        usuario.save(update_fields=['rol'])
        return Response(
            {
                'detail': f"Rol de {usuario.username} actualizado exitosamente a '{usuario.get_rol_display()}'.",
                'usuario': usuarioSerializer(usuario).data
            },
            status=status.HTTP_200_OK
        )


