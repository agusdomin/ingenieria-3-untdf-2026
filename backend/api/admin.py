from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Usuario, PlanSalida, Observacion


@admin.register(Usuario)
class UsuarioAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('Información Adicional', {'fields': ('nombre', 'certificacion', 'rol')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Información Adicional', {'fields': ('nombre', 'certificacion', 'rol')}),
    )
    list_display = ('username', 'email', 'nombre', 'rol', 'is_staff')
    list_filter = ('rol', 'is_staff', 'is_superuser', 'is_active')


@admin.register(PlanSalida)
class PlanSalidaAdmin(admin.ModelAdmin):
    list_display = ('id', 'usuario', 'coordenadas', 'fecha_hora_inicio', 'fecha_hora_retorno', 'cantidad_acompanantes', 'estado')
    list_filter = ('estado', 'fecha_hora_inicio')
    search_fields = ('usuario__username', 'usuario__nombre', 'coordenadas', 'itinerario_descripcion')


@admin.register(Observacion)
class ObservacionAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'usuario', 'tipo', 'nivel_relevancia', 'fecha_hora')
    list_filter = ('tipo', 'nivel_relevancia', 'fecha_hora')
    search_fields = ('titulo', 'descripcion', 'usuario__username')
