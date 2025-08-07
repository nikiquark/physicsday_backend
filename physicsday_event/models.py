from django.db import models
# Create your models here.
    
class Participant(models.Model):
    role = models.CharField(max_length=100, verbose_name='Роль')
    name = models.CharField(max_length=100, verbose_name='ФИО')
    email = models.EmailField(verbose_name='Email')
    phone = models.CharField(max_length=150, verbose_name='Телефон')
    city = models.CharField(max_length=150, verbose_name='Город')
    school = models.CharField(max_length=200, verbose_name='Школа', null=True, blank=True)
    class_number = models.IntegerField(verbose_name='Класс', null=True, blank=True)


    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = "Участник"
        verbose_name_plural = "Участники"

    