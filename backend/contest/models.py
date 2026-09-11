"""Заявки на конкурс рисунков «Приключения котофизиков в мире науки».

Отдельное приложение, а не поле в content: там живёт редактируемое
содержимое сайта, а здесь — заявки участников с файлами.
"""

import os

from django.db import models

from content.registration import normalize_email, normalize_name

from .validators import validate_artwork_extension, validate_artwork_size

# Условия конкурса: работы авторов 5–17 лет. Заявку с другим возрастом
# форма всё равно примет — отсекать ребёнка на сайте нельзя, решение
# принимает жюри, — но в админке такая строка подсвечивается.
MIN_AGE = 5
MAX_AGE = 17

# Форматы, которые браузер нарисует сам. HEIC в этот список не входит:
# превью для него не будет ни в форме, ни в админке.
PREVIEWABLE_EXTENSIONS = ('.jpg', '.jpeg', '.png', '.webp')


class Artwork(models.Model):
    author_name = models.CharField('ФИО автора', max_length=256)
    age = models.PositiveSmallIntegerField('Возраст')
    city = models.CharField('Город', max_length=150)
    school = models.CharField('Школа', max_length=200, blank=True, default='')
    class_number = models.IntegerField(
        'Класс',
        null=True,
        blank=True,
        help_text='0 — дошкольник, как в остальных заявках.',
    )
    title = models.CharField('Название работы', max_length=256, blank=True, default='')
    parent_name = models.CharField(
        'ФИО родителя или законного представителя',
        max_length=256,
        blank=True,
        default='',
    )
    email = models.EmailField('Email')
    phone = models.CharField('Телефон', max_length=150)

    photo = models.FileField(
        'Фото или скан работы',
        upload_to='contest_works/',
        validators=[validate_artwork_extension, validate_artwork_size],
    )

    # FileField, а не ImageField: ImageField проверяет файл через Pillow,
    # а Pillow без pillow-heif не открывает HEIC — айфонные снимки
    # отлетали бы с ошибкой «Upload a valid image».
    publication_consent = models.BooleanField(
        'Согласие на публикацию работы',
        default=False,
        help_text='Работы публикуются на сайте и в сообществе ВКонтакте.',
    )

    is_published = models.BooleanField('Опубликовано', default=False)
    moderation_note = models.TextField('Заметка жюри', blank=True, default='')

    created_at = models.DateTimeField('Дата заявки', auto_now_add=True)

    # Правило «одна работа от автора». Проверка живёт в сериализаторе,
    # констрейнт страхует от гонки двух одновременных отправок формы.
    name_norm = models.CharField(max_length=256, editable=False, default='')
    email_norm = models.EmailField(editable=False, default='')

    class Meta:
        verbose_name = 'Работа на конкурс'
        verbose_name_plural = 'Работы на конкурс'
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(
                fields=['name_norm', 'email_norm'],
                name='contest_one_artwork_per_author',
            ),
        ]

    def __str__(self):
        return f'{self.author_name} ({self.age})'

    def save(self, *args, **kwargs):
        self.name_norm = normalize_name(self.author_name)
        self.email_norm = normalize_email(self.email)
        super().save(*args, **kwargs)

    @property
    def age_out_of_range(self):
        return not (MIN_AGE <= self.age <= MAX_AGE)

    @property
    def photo_extension(self):
        if not self.photo:
            return ''
        return os.path.splitext(self.photo.name)[1].lower()

    @property
    def has_preview(self):
        """Нарисует ли браузер этот файл в теге <img>."""
        return self.photo_extension in PREVIEWABLE_EXTENSIONS
