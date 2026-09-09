from datetime import time, timedelta

from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient

from content.models import RegistrationSection

from .models import Participant, Workshop


def make_workshop(**kwargs):
    defaults = dict(
        name='Электромагнетизм', restriction='5-9 класс', time=time(10, 45),
        room='321', limit=2, ordering=1,
    )
    defaults.update(kwargs)
    return Workshop.objects.create(**defaults)


def payload(workshop, **kwargs):
    data = dict(
        name='Иванов Пётр', email='petr@example.com', phone='+70000000000',
        city='Новосибирск', school='Школа №1', class_number=7, workshop=workshop.pk,
    )
    data.update(kwargs)
    return data


class WorkshopRegistrationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse('workshops:participants')
        RegistrationSection.objects.create(slug=RegistrationSection.WORKSHOPS)
        self.workshop = make_workshop()
        self.other = make_workshop(name='Электростатика', time=time(12, 45), ordering=2)

    def test_registration_succeeds(self):
        response = self.client.post(self.url, payload(self.workshop), format='json')
        self.assertEqual(response.status_code, 201, response.data)
        self.assertEqual(Participant.objects.count(), 1)

    def test_same_person_cannot_take_a_second_workshop(self):
        self.client.post(self.url, payload(self.workshop), format='json')
        response = self.client.post(self.url, payload(self.other), format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('только на один мастер-класс', str(response.data))

    def test_same_person_cannot_take_the_same_workshop_at_another_time(self):
        """Именно этим злоупотребляли: одно название, каждое время."""
        later = make_workshop(name='Электромагнетизм', time=time(13, 45), ordering=3)
        self.client.post(self.url, payload(self.workshop), format='json')
        response = self.client.post(self.url, payload(later), format='json')
        self.assertEqual(response.status_code, 400)

    def test_duplicate_detected_despite_case_spaces_and_yo(self):
        self.client.post(self.url, payload(self.workshop), format='json')
        response = self.client.post(
            self.url,
            payload(self.other, name='  иванов  ПЕТР ', email='Petr@Example.COM '),
            format='json',
        )
        self.assertEqual(response.status_code, 400)

    def test_parent_can_register_two_children_from_one_email(self):
        self.client.post(self.url, payload(self.workshop, name='Иванов Пётр'), format='json')
        response = self.client.post(
            self.url, payload(self.other, name='Иванова Мария'), format='json',
        )
        self.assertEqual(response.status_code, 201, response.data)

    def test_limit_is_enforced(self):
        small = make_workshop(name='Аэродинамика', limit=1, ordering=4)
        self.client.post(self.url, payload(small, name='Первый Участник', email='a@e.com'), format='json')
        response = self.client.post(
            self.url, payload(small, name='Второй Участник', email='b@e.com'), format='json',
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn('места', str(response.data))

    def test_closed_window_rejects_submission(self):
        """Форма скрыта, но вкладка могла остаться открытой."""
        section = RegistrationSection.objects.get(slug=RegistrationSection.WORKSHOPS)
        section.opens_at = timezone.now() + timedelta(days=4)
        section.message_before = 'Регистрация откроется 14 сентября'
        section.save()

        response = self.client.post(self.url, payload(self.workshop), format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('14 сентября', str(response.data))

    def test_force_closed_rejects_submission(self):
        section = RegistrationSection.objects.get(slug=RegistrationSection.WORKSHOPS)
        section.force_closed = True
        section.save()
        response = self.client.post(self.url, payload(self.workshop), format='json')
        self.assertEqual(response.status_code, 400)


class WorkshopAdminTests(TestCase):
    """Раньше модель кидала DRF-исключение прямо из save() и роняла админку."""

    def test_duplicate_via_orm_raises_database_error_not_500_in_serializer(self):
        RegistrationSection.objects.create(slug=RegistrationSection.WORKSHOPS)
        workshop = make_workshop()
        Participant.objects.create(
            name='Иванов Пётр', email='petr@example.com', phone='1',
            city='Новосибирск', class_number=7, workshop=workshop,
        )
        from django.db import IntegrityError, transaction
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                Participant.objects.create(
                    name='ИВАНОВ ПЕТР', email='PETR@example.com', phone='2',
                    city='Новосибирск', class_number=7, workshop=workshop,
                )
