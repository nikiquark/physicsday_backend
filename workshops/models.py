from django.db import models
from rest_framework.exceptions import NotAcceptable
# Create your models here.

class Workshop(models.Model):
    name = models.CharField(max_length=100)
    restriction = models.CharField(max_length=100)
    time = models.CharField(max_length=100)
    room = models.CharField(max_length=100)
    limit = models.IntegerField()
    ordering = models.IntegerField()
    image = models.ImageField(default='default_logo.jpg', upload_to='workshops_images')


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

    workshop = models.ForeignKey(Workshop, on_delete=models.CASCADE)

    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = "Участник"
        verbose_name_plural = "Участники"

    # save only if limit is not reached
    def save(self, *args, **kwargs):
        if self.workshop.limit_left > 0:
            super().save(*args, **kwargs)
        else:
            raise NotAcceptable()
    