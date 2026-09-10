from datetime import timedelta

from django.test import TestCase, override_settings
from django.utils import timezone

from .models import RegistrationSection
from .registration import normalize_email, normalize_name


class NormalizeTests(TestCase):
    def test_name_ignores_case_spaces_and_yo(self):
        variants = ['Иванов Пётр', 'иванов  пётр ', 'ИВАНОВ ПЕТР']
        self.assertEqual({normalize_name(v) for v in variants}, {'иванов петр'})

    def test_patronymic_makes_a_different_person(self):
        self.assertNotEqual(
            normalize_name('Иванов Пётр'),
            normalize_name('Иванов Пётр Сергеевич'),
        )

    def test_email_case_and_spaces(self):
        self.assertEqual(normalize_email('  Mail@Example.COM '), 'mail@example.com')


class RegistrationWindowTests(TestCase):
    def make(self, **kwargs):
        return RegistrationSection.objects.create(slug='workshops', **kwargs)

    def test_before_opening(self):
        section = self.make(opens_at=timezone.now() + timedelta(days=1))
        self.assertEqual(section.status, 'before')
        self.assertFalse(section.is_open)

    def test_open_between_dates(self):
        section = self.make(
            opens_at=timezone.now() - timedelta(days=1),
            closes_at=timezone.now() + timedelta(days=1),
        )
        self.assertTrue(section.is_open)

    def test_closed_after_deadline(self):
        section = self.make(closes_at=timezone.now() - timedelta(minutes=1))
        self.assertEqual(section.status, 'after')

    def test_force_closed_beats_dates(self):
        section = self.make(
            opens_at=timezone.now() - timedelta(days=1),
            closes_at=timezone.now() + timedelta(days=1),
            force_closed=True,
        )
        self.assertFalse(section.is_open)

    def test_message_before_is_generated_from_date(self):
        section = self.make(opens_at=timezone.now().replace(month=9, day=14) + timedelta(days=365))
        self.assertIn('сентября', section.message)

    def test_explicit_message_wins(self):
        section = self.make(
            opens_at=timezone.now() + timedelta(days=1),
            message_before='Регистрация откроется 14 сентября',
        )
        self.assertEqual(section.message, 'Регистрация откроется 14 сентября')


@override_settings(ALLOWED_HOSTS=['backend', 'physicsday.ru', 'testserver'])
class MediaUrlTests(TestCase):
    """Адреса картинок не должны зависеть от того, кто спрашивает.

    Фронтенд запрашивает API дважды разными путями: при серверном
    рендере — по внутреннему имени docker-сети (backend:8000), а из
    браузера — по домену сайта. Стандартное поле DRF подставляло бы
    в ответ Host запросившего, и в браузер уезжал бы адрес
    http://backend:8000/media/..., который не резолвится.
    """

    def setUp(self):
        from datetime import datetime, time as dtime

        from django.utils import timezone
        from excursions.models import Institute
        from workshops.models import Workshop

        from .models import Partner, ProgramItem

        ProgramItem.objects.create(title='Мастер-классы', image='seed/program/workshops.jpg', ordering=1)
        Partner.objects.create(name='ИЯФ СО РАН', logo='seed/partners/binp.jpg', ordering=1)
        Workshop.objects.create(
            name='Электромагнетизм', restriction='5-9 класс', time=dtime(10, 45),
            room='321', limit=10, ordering=1, image='seed/workshops/elmag.jpg',
        )
        Institute.objects.create(
            name='ИХБФМ', limit=150, address='Лаврентьева, 8',
            starts_at=timezone.make_aware(datetime(2026, 10, 3, 11, 0)),
            ordering=1, image='seed/institutes/binp.jpg',
        )

    def assert_relative(self, url):
        self.assertIsNotNone(url)
        self.assertTrue(
            url.startswith('/media/'),
            f'ожидался путь от корня домена, получено {url!r}',
        )

    def test_urls_are_relative_for_internal_docker_host(self):
        response = self.client.get('/api/content/', HTTP_HOST='backend:8000')
        self.assertEqual(response.status_code, 200)
        self.assert_relative(response.data['program'][0]['image'])
        self.assert_relative(response.data['partners'][0]['logo'])

    def test_urls_are_relative_for_public_host(self):
        response = self.client.get('/api/content/', HTTP_HOST='physicsday.ru')
        self.assertEqual(response.status_code, 200)
        self.assert_relative(response.data['program'][0]['image'])

    def test_catalog_urls_are_relative_too(self):
        for path in ('/api/workshops/', '/api/excursions/'):
            with self.subTest(path=path):
                response = self.client.get(path, HTTP_HOST='backend:8000')
                self.assertEqual(response.status_code, 200)
                self.assert_relative(response.data[0]['image'])

    def test_internal_hostname_never_appears_in_response(self):
        raw = self.client.get('/api/content/', HTTP_HOST='backend:8000').content.decode()
        self.assertNotIn('backend:8000', raw)
