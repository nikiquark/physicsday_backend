from datetime import datetime, timedelta

from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient

from content.models import RegistrationSection

from .models import Institute, Participant


def make_institute(**kwargs):
    defaults = dict(
        name='ИХБФМ', limit=10, address='Лаврентьева, 8',
        starts_at=timezone.make_aware(datetime(2026, 10, 3, 11, 0)), ordering=1,
    )
    defaults.update(kwargs)
    return Institute.objects.create(**defaults)


def payload(institute, **kwargs):
    data = dict(
        name='Иванов Пётр', passport='5000 123456', phone='+70000000000',
        email='petr@example.com', underages_count=0, underages='',
        institute=institute.pk,
    )
    data.update(kwargs)
    return data


class ExcursionRegistrationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse('excursions:participants')
        RegistrationSection.objects.create(slug=RegistrationSection.EXCURSIONS)
        self.institute = make_institute()
        self.other = make_institute(name='ИЯФ', ordering=2)

    def test_registration_succeeds(self):
        response = self.client.post(self.url, payload(self.institute), format='json')
        self.assertEqual(response.status_code, 201, response.data)

    def test_same_person_cannot_take_a_second_excursion(self):
        self.client.post(self.url, payload(self.institute), format='json')
        response = self.client.post(self.url, payload(self.other), format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('только на одну экскурсию', str(response.data))

    def test_workshop_registration_does_not_block_excursion(self):
        """Лимиты независимые: один мастер-класс И одна экскурсия."""
        from workshops.models import Participant as WorkshopParticipant, Workshop
        from datetime import time as dtime
        workshop = Workshop.objects.create(
            name='Электростатика', restriction='5-9', time=dtime(12, 45),
            room='324', limit=10, ordering=1,
        )
        WorkshopParticipant.objects.create(
            name='Иванов Пётр', email='petr@example.com', phone='1',
            city='Новосибирск', class_number=7, workshop=workshop,
        )
        response = self.client.post(self.url, payload(self.institute), format='json')
        self.assertEqual(response.status_code, 201, response.data)

    def test_accompanying_adult_takes_a_seat_for_every_child(self):
        institute = make_institute(name='ИТПМ', limit=3, ordering=3)
        response = self.client.post(
            self.url, payload(institute, underages_count=2, underages='Дети'), format='json',
        )
        self.assertEqual(response.status_code, 201, response.data)
        institute.refresh_from_db()
        self.assertEqual(institute.limit_left, 0)

    def test_group_larger_than_free_seats_is_rejected(self):
        institute = make_institute(name='ИК', limit=2, ordering=4)
        response = self.client.post(
            self.url, payload(institute, underages_count=5, underages='Дети'), format='json',
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(Participant.objects.count(), 0)

    def test_closed_window_rejects_submission(self):
        section = RegistrationSection.objects.get(slug=RegistrationSection.EXCURSIONS)
        section.opens_at = timezone.now() + timedelta(days=4)
        section.save()
        response = self.client.post(self.url, payload(self.institute), format='json')
        self.assertEqual(response.status_code, 400)


class InstituteApiTests(TestCase):
    def test_time_is_rendered_as_russian_date(self):
        make_institute()
        response = APIClient().get(reverse('excursions:list'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data[0]['time'], '3 октября, 11:00')
        self.assertEqual(response.data[0]['address'], 'Лаврентьева, 8')
