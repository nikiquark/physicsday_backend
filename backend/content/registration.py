"""Общие правила приёма заявок.

Живут здесь, а не в каждом приложении по-своему, потому что применяются
одинаково к ФизФесту, мастер-классам, экскурсиям и олимпиадам.
"""

import re

from rest_framework import serializers

from .models import RegistrationSection

_SPACES = re.compile(r'\s+')


def normalize_name(value):
    """Приводит ФИО к виду, по которому сравниваются заявки.

    Регистр, лишние пробелы и «ё» человек пишет как придётся, поэтому
    они не должны создавать нового участника. Отчество, наоборот,
    сохраняется: «Иванов Пётр» и «Иванов Пётр Сергеевич» — разные ключи.
    """
    if not value:
        return ''
    value = _SPACES.sub(' ', value).strip().lower()
    return value.replace('ё', 'е')


def normalize_email(value):
    if not value:
        return ''
    return value.strip().lower()


def ensure_registration_open(slug):
    """Проверяет окно регистрации на стороне сервера.

    Скрыть форму на фронтенде недостаточно: вкладка, открытая до закрытия,
    отправит заявку и после него.

    Если раздел не заведён в админке, приём заявок не блокируется —
    отсутствие настройки не должно останавливать регистрацию.
    """
    section = RegistrationSection.objects.filter(slug=slug).first()
    if section is None:
        return
    if not section.is_open:
        raise serializers.ValidationError({
            'non_field_errors': [section.message or 'Регистрация закрыта.'],
        })


class RegistrationWindowMixin:
    """Подмешивается в сериализатор заявки. Требует атрибут registration_slug."""

    registration_slug = None

    def validate(self, attrs):
        attrs = super().validate(attrs)
        if self.registration_slug:
            ensure_registration_open(self.registration_slug)
        return attrs
