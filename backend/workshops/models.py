from django.db import models

from content.registration import normalize_email, normalize_name


class Workshop(models.Model):
    name = models.CharField(max_length=100, verbose_name='Название')
    restriction = models.CharField(max_length=100, verbose_name='Возраст')
    time = models.TimeField(verbose_name='Время')
    room = models.CharField(max_length=100, verbose_name='Аудитория')
    limit = models.IntegerField(verbose_name='Ограничение')
    ordering = models.IntegerField(verbose_name='Порядок')
    image = models.ImageField(
        default='default_logo.jpg',
        upload_to='workshops_images',
        verbose_name='Изображение',
    )

    def __str__(self):
        return f'{self.name} ({self.time:%H:%M})'

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

    created_at = models.DateTimeField('Дата заявки', auto_now_add=True, null=True)

    # Служебные поля для правила «один мастер-класс на человека».
    # Проверка живёт в сериализаторе, а констрейнт в БД страхует от гонки
    # двух одновременных отправок формы.
    name_norm = models.CharField(max_length=100, editable=False, default='')
    email_norm = models.EmailField(editable=False, default='')

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Участник"
        verbose_name_plural = "Участники"
        constraints = [
            models.UniqueConstraint(
                fields=['name_norm', 'email_norm'],
                name='workshops_one_registration_per_person',
            ),
        ]

    def save(self, *args, **kwargs):
        self.name_norm = normalize_name(self.name)
        self.email_norm = normalize_email(self.email)
        super().save(*args, **kwargs)
