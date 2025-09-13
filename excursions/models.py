from django.db import models
from rest_framework.exceptions import NotAcceptable
# Create your models here.

from rest_framework.exceptions import ValidationError
from django.core.exceptions import ValidationError as DjangoValidationError

class Institute(models.Model):
    name = models.CharField(max_length=256, verbose_name='Название')
    limit = models.IntegerField(verbose_name='Ограничение')
    adress = models.CharField(max_length=256, verbose_name='Адрес')
    time = models.CharField(max_length=256, verbose_name='Время')
    image = models.ImageField(default='default_logo.jpg', upload_to='institutes_images')
    ordering = models.IntegerField()


    def __str__(self):
        return f'{self.name}'
    
    class Meta:
        verbose_name = "Институт"
        verbose_name_plural = "Институты"
        ordering = ['ordering']

    @property
    def limit_left(self):
        return self.limit - sum([participant.underages_count for participant in self.participant_set.all()]) - self.participant_set.count()
    
    
class Participant(models.Model):
    name = models.CharField(max_length=256, verbose_name='ФИО')
    passport = models.CharField(max_length=20, verbose_name='Паспорт')
    phone = models.CharField(max_length=150, verbose_name='Контакт')
    email = models.EmailField(verbose_name='Email')
    underages_count = models.IntegerField(verbose_name='Количество детей', default=0)
    underages = models.TextField(blank=True, default='')

    institute = models.ForeignKey(Institute, on_delete=models.CASCADE, related_name='participant_set')

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
            error_message = f"Вы уже записались на экскурсию в {existing_participant.institute.name}. Можно записаться только на одну экскурсию."
            raise ValidationError({"non_field_errors": [error_message]})
        
        # Проверяем лимит места
        if self.institute.limit_left <= 0:
            raise ValidationError({"non_field_errors": ["К сожалению, места в этот институт закончились."]})
        
        super().save(*args, **kwargs)