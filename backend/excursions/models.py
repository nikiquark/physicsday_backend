from django.db import models

from content.registration import normalize_email, normalize_name


class Institute(models.Model):
    name = models.CharField(max_length=256, verbose_name='Название')
    limit = models.IntegerField(verbose_name='Ограничение')
    address = models.CharField(max_length=256, verbose_name='Адрес')
    starts_at = models.DateTimeField(verbose_name='Дата и время')
    image = models.ImageField(
        default='default_logo.jpg',
        upload_to='institutes_images',
        verbose_name='Изображение',
    )
    ordering = models.IntegerField(verbose_name='Порядок')

    def __str__(self):
        return f'{self.name}'

    class Meta:
        verbose_name = "Институт"
        verbose_name_plural = "Институты"
        ordering = ['ordering']

    @property
    def limit_left(self):
        taken = sum(p.underages_count for p in self.participant_set.all()) + self.participant_set.count()
        return self.limit - taken


class Participant(models.Model):
    name = models.CharField(max_length=256, verbose_name='ФИО')
    passport = models.CharField(max_length=20, verbose_name='Паспорт')
    phone = models.CharField(max_length=150, verbose_name='Контакт')
    email = models.EmailField(verbose_name='Email')
    underages_count = models.IntegerField(verbose_name='Количество детей', default=0)
    underages = models.TextField(blank=True, default='', verbose_name='Данные детей')
    institute = models.ForeignKey(
        Institute, on_delete=models.CASCADE, related_name='participant_set', verbose_name='Институт',
    )

    created_at = models.DateTimeField('Дата заявки', auto_now_add=True, null=True)

    # См. комментарий в workshops.models.Participant.
    name_norm = models.CharField(max_length=256, editable=False, default='')
    email_norm = models.EmailField(editable=False, default='')

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Участник"
        verbose_name_plural = "Участники"
        constraints = [
            models.UniqueConstraint(
                fields=['name_norm', 'email_norm'],
                name='excursions_one_registration_per_person',
            ),
        ]

    def save(self, *args, **kwargs):
        self.name_norm = normalize_name(self.name)
        self.email_norm = normalize_email(self.email)
        super().save(*args, **kwargs)
