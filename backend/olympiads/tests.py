from datetime import datetime

from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient

from content.models import RegistrationSection

from .models import Participant


class OlympiadRegistrationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse('olympiads:participants')
        self.data = dict(
            name='Иванов Пётр', email='petr@example.com', phone='+70000000000',
            city='Новосибирск', school='Школа №1', class_number=7,
        )

    def test_registration_succeeds_while_open(self):
        RegistrationSection.objects.create(
            slug=RegistrationSection.OLYMPIADS,
            closes_at=timezone.make_aware(datetime(2026, 10, 7, 10, 0)),
        )
        response = self.client.post(self.url, self.data, format='json')
        self.assertEqual(response.status_code, 201, response.data)

    def test_submission_after_deadline_is_rejected(self):
        """Дедлайн 10:00 7 октября по Новосибирску, а не по UTC."""
        RegistrationSection.objects.create(
            slug=RegistrationSection.OLYMPIADS,
            closes_at=timezone.now() - timezone.timedelta(minutes=1),
        )
        response = self.client.post(self.url, self.data, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertEqual(Participant.objects.count(), 0)

    def test_same_person_may_register_for_both_olympiads_and_workshops(self):
        RegistrationSection.objects.create(slug=RegistrationSection.OLYMPIADS)
        self.client.post(self.url, self.data, format='json')
        response = self.client.post(self.url, dict(self.data, name='Иванова Мария'), format='json')
        self.assertEqual(response.status_code, 201, response.data)
