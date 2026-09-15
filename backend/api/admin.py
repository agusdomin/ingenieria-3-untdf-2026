from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Usuario, Zona, PlanSalida


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


@admin.register(Zona)
class ZonaAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'altura', 'nivel_actual_peligro', 'es_multizona', 'zona_padre', 'creador', 'ultima_actualizacion')
    list_filter = ('nivel_actual_peligro', 'es_multizona')
    search_fields = ('nombre', 'descripcion', 'problema_principal')


@admin.register(PlanSalida)
class PlanSalidaAdmin(admin.ModelAdmin):
    list_display = ('id', 'usuario', 'zona', 'fecha_hora_inicio', 'fecha_hora_retorno', 'cantidad_acompanantes', 'estado')
    list_filter = ('estado', 'fecha_hora_inicio', 'zona')
    search_fields = ('usuario__username', 'usuario__nombre', 'zona__nombre', 'itinerario_descripcion')
