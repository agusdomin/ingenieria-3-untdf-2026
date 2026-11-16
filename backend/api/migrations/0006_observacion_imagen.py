import api.models.observacion
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('api', '0005_rename_nieve_datosmeteorologicos_nieve_fresca'),
    ]

    operations = [
        migrations.AddField(
            model_name='observacion',
            name='imagen',
            field=models.ImageField(
                blank=True,
                null=True,
                upload_to=api.models.observacion.observacion_imagen_path,
                verbose_name='Imagen',
            ),
        ),
    ]
