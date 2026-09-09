from datetime import timedelta

from django.test import TestCase
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
