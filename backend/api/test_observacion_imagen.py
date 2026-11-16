from io import BytesIO
from pathlib import Path
from tempfile import TemporaryDirectory
from uuid import UUID

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from PIL import Image
from rest_framework.test import APITestCase

from .models import Observacion, Usuario


class ObservacionImagenTests(APITestCase):
    def setUp(self):
        media = TemporaryDirectory()
        self.addCleanup(media.cleanup)
        settings = override_settings(MEDIA_ROOT=media.name)
        settings.enable()
        self.addCleanup(settings.disable)
        self.client.force_authenticate(Usuario.objects.create_user(username='imagen-test'))

    def test_upload_and_get_image_url(self):
        content = BytesIO()
        Image.new('RGB', (2, 2)).save(content, format='PNG')
        response = self.client.post('/api/observaciones/', {
            'tipo': 'nieve',
            'imagen': SimpleUploadedFile('foto.png', content.getvalue(), 'image/png'),
        }, format='multipart')
        self.assertEqual(response.status_code, 201, response.data)
        observacion = Observacion.objects.get(pk=response.data['id'])
        self.assertEqual(UUID(Path(observacion.imagen.name).stem).version, 4)
        with observacion.imagen.open('rb') as saved:
            self.assertEqual(saved.read(), content.getvalue())
        self.client.force_authenticate(user=None)
        detail = self.client.get(f'/api/observaciones/{observacion.pk}/')
        self.assertEqual(detail.status_code, 200)
        self.assertEqual(detail.data['imagen'], response.data['imagen'])
        self.assertIn('/media/observaciones/', detail.data['imagen'])

    def test_rejects_invalid_image(self):
        response = self.client.post('/api/observaciones/', {
            'tipo': 'nieve',
            'imagen': SimpleUploadedFile('foto.png', b'not an image', 'image/png'),
        }, format='multipart')
        self.assertEqual(response.status_code, 400)
        self.assertIn('imagen', response.data)
        self.assertFalse(Observacion.objects.exists())

    def test_image_is_optional_and_legacy_url_is_preserved(self):
        response = self.client.post('/api/observaciones/', {
            'tipo': 'nieve', 'foto_url': 'https://example.com/foto.jpg',
        }, format='json')
        self.assertEqual(response.status_code, 201, response.data)
        self.assertIsNone(response.data['imagen'])
        self.assertEqual(response.data['foto_url'], 'https://example.com/foto.jpg')
