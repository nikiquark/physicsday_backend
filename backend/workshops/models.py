from django.db import models
from rest_framework.exceptions import NotAcceptable
# Create your models here.

from rest_framework.exceptions import ValidationError
from django.core.exceptions import ValidationError as DjangoValidationError

class Workshop(models.Model):
    name = models.CharField(max_length=100, verbose_name='Название')
    restriction = models.CharField(max_length=100, verbose_name='Возраст')
    time = models.CharField(max_length=100, verbose_name='Время')
    room = models.CharField(max_length=100, verbose_name='Аудитория')
    limit = models.IntegerField(verbose_name='Ограничение')
    ordering = models.IntegerField(verbose_name='Порядок')
    image = models.ImageField(default='default_logo.jpg', upload_to='workshops_images', verbose_name='Изображение')

    def __str__(self):
        return f'{self.name} ({self.time})'
    
    class Meta:
        verbose_name = "Мастер-класс"
        verbose_name_plural = "Мастер-классы"

    @property
    def limit_left(self):
        return self.limit - self.participant_set.count()
    
    
class Participant(models.Model):
    name = models.CharField(max_length=100, verbose_name='ФИО')
    email = models.EmailField(verbose_name='Email')
    phone = models.CharField(max_length=150, verbose_name='Контакт')
    city = models.CharField(max_length=150, verbose_name='Город')
    school = models.CharField(max_length=200, verbose_name='Школа', null=True, blank=True)
    class_number = models.IntegerField(verbose_name='Класс')

    workshop = models.ForeignKey(Workshop, on_delete=models.CASCADE, verbose_name='Мастер-класс')

    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = "Участник"
        verbose_name_plural = "Участники"

    def save(self, *args, **kwargs):
        # Проверяем дублирование по ФИО и email
        existing_participant = Participant.objects.filter(
            name=self.name,
            email=self.email
        ).first()
        
        if existing_participant:
            error_message = f"Вы уже зарегистрировались на «{existing_participant.workshop.name} {existing_participant.workshop.time}». Можно зарегистрироваться только на один мастер-класс."
            raise ValidationError({"non_field_errors": [error_message]})
        
        # Проверяем лимит места
        if self.workshop.limit_left <= 0:
            raise ValidationError({"non_field_errors": ["К сожалению, места на этот мастер-класс закончились."]})
        
        super().save(*args, **kwargs)