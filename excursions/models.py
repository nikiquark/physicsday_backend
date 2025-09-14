# models.py
from django.db import models

class Institute(models.Model):
    name = models.CharField(max_length=256, verbose_name='Название')
    limit = models.IntegerField(verbose_name='Ограничение')
    adress = models.CharField(max_length=256, verbose_name='Адрес')
    time = models.CharField(max_length=256, verbose_name='Время')
    image = models.ImageField(default='default_logo.jpg', upload_to='institutes_images', verbose_name='Изображение')
    ordering = models.IntegerField(verbose_name='Порядок')

    def __str__(self):
        return f'{self.name}'

    class Meta:
        verbose_name = "Институт"
        verbose_name_plural = "Институты"
        ordering = ['ordering']

    @property
    def limit_left(self):
        return self.limit - sum([p.underages_count for p in self.participant_set.all()]) - self.participant_set.count()


class Participant(models.Model):
    name = models.CharField(max_length=256, verbose_name='ФИО')
    passport = models.CharField(max_length=20, verbose_name='Паспорт')
    phone = models.CharField(max_length=150, verbose_name='Контакт')
    email = models.EmailField(verbose_name='Email')
    underages_count = models.IntegerField(verbose_name='Количество детей', default=0)
    underages = models.TextField(blank=True, default='', verbose_name='Данные детей')
    institute = models.ForeignKey(Institute, on_delete=models.CASCADE, related_name='participant_set', verbose_name='Институт')

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Участник"
        verbose_name_plural = "Участники"
