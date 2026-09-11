import shutil
import tempfile
from datetime import timedelta

from django.core.cache import cache
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient

from content.models import RegistrationSection

from .models import Artwork
from .validators import MAX_FILE_SIZE

MEDIA_ROOT = tempfile.mkdtemp()


def photo(name='cat.jpg', size=1024):
    return SimpleUploadedFile(name, b'x' * size, content_type='image/jpeg')


def payload(**kwargs):
    data = dict(
        author_name='Иванов Пётр',
        age=10,
        city='Новосибирск',
        email='petr@example.com',
        phone='+70000000000',
        publication_consent=True,
        photo=photo(),
    )
    data.update(kwargs)
    return data


@override_settings(MEDIA_ROOT=MEDIA_ROOT)
class ArtworkSubmissionTests(TestCase):
    @classmethod
    def tearDownClass(cls):
        shutil.rmtree(MEDIA_ROOT, ignore_errors=True)
        super().tearDownClass()

    def setUp(self):
        # Ограничение частоты живёт в кеше и иначе протекает между тестами.
        cache.clear()
        self.client = APIClient()
        self.url = reverse('contest:works')
        # Раздел уже заведён миграцией content/0003 — здесь он только
        # приводится к предсказуемому состоянию: открыт, без дат.
        self.section, _ = RegistrationSection.objects.get_or_create(
            slug=RegistrationSection.DRAWING_CONTEST,
        )
        self.section.opens_at = None
        self.section.closes_at = None
        self.section.force_closed = False
        self.section.save()

    def test_submission_succeeds(self):
        response = self.client.post(self.url, payload(), format='multipart')
        self.assertEqual(response.status_code, 201, response.data)
        self.assertEqual(Artwork.objects.count(), 1)

    def test_closed_window_rejects_submission(self):
        self.section.closes_at = timezone.now() - timedelta(minutes=1)
        self.section.save()

        response = self.client.post(self.url, payload(), format='multipart')
        self.assertEqual(response.status_code, 400)
        self.assertEqual(Artwork.objects.count(), 0)

    def test_second_work_from_same_author_is_rejected(self):
        self.client.post(self.url, payload(), format='multipart')
        response = self.client.post(
            self.url,
            payload(author_name='иванов  пётр ', email='PETR@example.com'),
            format='multipart',
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn('уже подали работу', str(response.data))
        self.assertEqual(Artwork.objects.count(), 1)

    def test_oversized_file_is_rejected(self):
        response = self.client.post(
            self.url,
            payload(photo=photo(size=MAX_FILE_SIZE + 1)),
            format='multipart',
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn('photo', response.data)

    def test_forbidden_extension_is_rejected(self):
        response = self.client.post(
            self.url, payload(photo=photo(name='work.pdf')), format='multipart',
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn('photo', response.data)

    def test_heic_from_iphone_is_accepted(self):
        response = self.client.post(
            self.url, payload(photo=photo(name='IMG_0001.HEIC')), format='multipart',
        )
        self.assertEqual(response.status_code, 201, response.data)
        self.assertFalse(Artwork.objects.get().has_preview)

    def test_age_outside_the_rules_is_accepted_and_flagged(self):
        response = self.client.post(self.url, payload(age=3), format='multipart')
        self.assertEqual(response.status_code, 201, response.data)
        self.assertTrue(Artwork.objects.get().age_out_of_range)

    def test_publication_consent_is_required(self):
        response = self.client.post(
            self.url, payload(publication_consent=False), format='multipart',
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn('publication_consent', response.data)
        self.assertEqual(Artwork.objects.count(), 0)
