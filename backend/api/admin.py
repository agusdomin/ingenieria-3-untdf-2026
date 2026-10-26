from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Usuario, PlanSalida, Observacion, Certificacion


class CertificacionInline(admin.TabularInline):
    model = Certificacion
    fk_name = 'usuario'
    extra = 0
    readonly_fields = ('fecha_subida', 'fecha_revision', 'revisado_por')



@admin.register(Usuario)
class UsuarioAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('Información Adicional', {'fields': ('nombre', 'rol')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Información Adicional', {'fields': ('nombre', 'rol')}),
    )
    list_display = ('username', 'email', 'nombre', 'rol', 'is_staff')
    list_filter = ('rol', 'is_staff', 'is_superuser', 'is_active')
    inlines = [CertificacionInline]



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


@admin.register(Certificacion)
class CertificacionAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'usuario', 'entidad_emisora', 'estado', 'fecha_subida', 'revisado_por')
    list_filter = ('estado', 'fecha_subida')
    search_fields = ('titulo', 'entidad_emisora', 'usuario__username', 'usuario__nombre')

