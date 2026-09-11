"""Редактируемое содержимое сайта.

Всё, что здесь лежит, правится через админку без участия разработчика:
даты, тексты, картинки плиток, партнёры, окна регистрации, SEO.

Граница простая: если у сущности есть счётчик мест или связь с участником —
её место в приложениях workshops/excursions, а не здесь.
"""

from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone


class SingletonModel(models.Model):
    """Модель, у которой всегда ровно одна строка."""

    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        # Удалять настройки нельзя: без них сайт нечем наполнить.
        pass

    @classmethod
    def get_solo(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj


class SiteSettings(SingletonModel):
    """Общие настройки сайта. В админке — один пункт «Настройки сайта»."""

    # ── Фестиваль ───────────────────────────────────────────────────────
    event_date = models.DateField(
        'Дата фестиваля',
        default='2026-09-27',
        help_text='Показывается на главной большими буквами.',
    )
    event_time = models.TimeField('Время начала', default='11:00')
    event_place = models.CharField(
        'Место проведения',
        max_length=255,
        default='Главный корпус НГУ (Пирогова, 2)',
    )
    event_description = models.TextField(
        'Описание фестиваля',
        default=(
            'Фестиваль науки "ФизФест" — масштабное событие, организуемое студентами '
            'и молодыми учеными Новосибирского государственного университета с целью '
            'популяризации физики среди школьников и общественности. Участники смогут '
            'не только увлекательно провести время, но и пополнить свои знания в области '
            'естествознания, приобщиться к фундаментальной науке, познакомиться '
            'с учеными-практиками.'
        ),
        help_text='Абзац под заголовком на главной странице.',
    )

    # ── Олимпиады ───────────────────────────────────────────────────────
    olympiad_dates = models.CharField(
        'Олимпиады: даты проведения',
        max_length=255,
        default='10 — 12 октября 2026',
    )
    olympiad_format = models.CharField(
        'Олимпиады: формат',
        max_length=255,
        default='дистанционный',
    )
    olympiad_results_date = models.CharField(
        'Олимпиады: подведение итогов',
        max_length=255,
        default='не позднее 2 ноября 2026',
    )
    show_olympiad_results = models.BooleanField(
        'Показывать итоги олимпиады',
        default=False,
        help_text='Управляет и кнопкой «Итоги олимпиады», и блоком с '
                  'победителями. Пока итогов нет — выключено.',
    )
    show_awards_ceremony = models.BooleanField(
        'Показывать блок о церемонии награждения',
        default=False,
    )
    awards_ceremony_html = models.TextField(
        'Церемония награждения: текст',
        blank=True,
        default='',
        help_text='Можно использовать HTML-теги.',
    )

    # ── Контакты ────────────────────────────────────────────────────────
    contact_person = models.CharField(
        'Контактное лицо',
        max_length=255,
        default='Котельникова Мария Станиславовна',
    )
    contact_email = models.EmailField('Контактный email', default='m.kotelnikova@g.nsu.ru')
    contact_phone = models.CharField('Контактный телефон', max_length=64, default='+7-913-921-00-54')
    footer_copyright = models.CharField(
        'Подпись в подвале',
        max_length=255,
        default='© Физический факультет НГУ',
    )

    # ── Персональные данные ─────────────────────────────────────────────
    consent_text = models.TextField(
        'Текст согласия на обработку персональных данных',
        default='Я даю согласие на обработку персональных данных',
    )
    privacy_policy_url = models.CharField(
        'Ссылка на политику обработки персональных данных',
        max_length=500,
        blank=True,
        default='',
    )

    class Meta:
        verbose_name = 'Настройки сайта'
        verbose_name_plural = 'Настройки сайта'

    def __str__(self):
        return 'Настройки сайта'


class RegistrationSection(models.Model):
    """Окно регистрации на один раздел сайта.

    Открытие и закрытие задаются датами, чтобы никто не караулил 10:00
    у компьютера. Отдельный рубильник force_closed перекрывает даты —
    он нужен, когда мест не осталось и закрывать надо прямо сейчас.
    """

    PHYSICSDAY = 'physicsday'
    WORKSHOPS = 'workshops'
    EXCURSIONS = 'excursions'
    OLYMPIADS = 'olympiads'
    DRAWING_CONTEST = 'drawing_contest'

    SLUG_CHOICES = [
        (PHYSICSDAY, 'ФизФест'),
        (WORKSHOPS, 'Мастер-классы'),
        (EXCURSIONS, 'Экскурсии'),
        (OLYMPIADS, 'Олимпиады'),
        (DRAWING_CONTEST, 'Конкурс рисунков'),
    ]

    slug = models.SlugField('Раздел', max_length=32, choices=SLUG_CHOICES, unique=True)
    opens_at = models.DateTimeField(
        'Открытие регистрации',
        null=True,
        blank=True,
        help_text='Время новосибирское. Пусто — открыта с самого начала.',
    )
    closes_at = models.DateTimeField(
        'Закрытие регистрации',
        null=True,
        blank=True,
        help_text='Время новосибирское. Пусто — не закрывается по времени.',
    )
    force_closed = models.BooleanField(
        'Закрыть принудительно',
        default=False,
        help_text='Перекрывает даты. Включите, если места закончились.',
    )
    closed_title = models.CharField(
        'Заголовок вместо формы',
        max_length=255,
        default='Регистрация закрыта',
    )
    message_before = models.TextField(
        'Текст до открытия',
        blank=True,
        default='',
        help_text='Например: «Регистрация откроется 14 сентября». Если оставить '
                  'пустым, текст соберётся из даты открытия автоматически.',
    )
    message_after = models.TextField(
        'Текст после закрытия',
        blank=True,
        default='Регистрация завершена. Следите за обновлениями на нашем сайте.',
    )

    class Meta:
        verbose_name = 'Регистрация: раздел'
        verbose_name_plural = 'Регистрация: разделы'
        ordering = ['slug']

    def __str__(self):
        return f'{self.get_slug_display()} — {self.get_status_display_ru()}'

    def clean(self):
        if self.opens_at and self.closes_at and self.opens_at >= self.closes_at:
            raise ValidationError(
                {'closes_at': 'Закрытие должно быть позже открытия.'}
            )

    @property
    def status(self):
        """'before' — ещё не открыта, 'open' — идёт, 'after' — закрыта."""
        if self.force_closed:
            return 'after'
        now = timezone.now()
        if self.opens_at and now < self.opens_at:
            return 'before'
        if self.closes_at and now >= self.closes_at:
            return 'after'
        return 'open'

    @property
    def is_open(self):
        return self.status == 'open'

    def get_status_display_ru(self):
        return {
            'before': 'ещё не открыта',
            'open': 'открыта',
            'after': 'закрыта',
        }[self.status]

    @property
    def message(self):
        """Текст, который видит посетитель вместо формы."""
        status = self.status
        if status == 'open':
            return ''
        if status == 'after':
            return self.message_after
        if self.message_before:
            return self.message_before
        if self.opens_at:
            local = timezone.localtime(self.opens_at)
            months = (
                'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
                'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
            )
            return f'Регистрация откроется {local.day} {months[local.month - 1]}.'
        return 'Регистрация пока не открыта.'


class ProgramItem(models.Model):
    """Плитка в блоке «Программа» на главной."""

    title = models.CharField(
        'Заголовок',
        max_length=255,
        blank=True,
        default='',
        help_text='Можно оставить пустым — будет плитка только с картинкой.',
    )
    image = models.ImageField('Картинка', upload_to='program_images')
    href = models.CharField(
        'Ссылка',
        max_length=255,
        blank=True,
        default='',
        help_text='Например /masters. Пусто — плитка некликабельна.',
    )
    ordering = models.IntegerField('Порядок', default=0)
    is_visible = models.BooleanField('Показывать', default=True)

    class Meta:
        verbose_name = 'Программа: плитка'
        verbose_name_plural = 'Программа: плитки'
        ordering = ['ordering', 'id']

    def __str__(self):
        return self.title or f'Плитка #{self.pk}'


class Partner(models.Model):
    name = models.CharField('Название', max_length=255)
    logo = models.ImageField('Логотип', upload_to='partner_logos')
    website = models.URLField('Сайт', blank=True, default='')
    ordering = models.IntegerField('Порядок', default=0)
    is_visible = models.BooleanField('Показывать', default=True)

    class Meta:
        verbose_name = 'Партнёр'
        verbose_name_plural = 'Партнёры'
        ordering = ['ordering', 'name']

    def __str__(self):
        return self.name


class SocialLink(models.Model):
    title = models.CharField('Подпись', max_length=255)
    url = models.URLField('Ссылка')
    ordering = models.IntegerField('Порядок', default=0)
    is_visible = models.BooleanField('Показывать', default=True)

    class Meta:
        verbose_name = 'Соцсеть'
        verbose_name_plural = 'Соцсети'
        ordering = ['ordering', 'id']

    def __str__(self):
        return self.title


class OlympiadResult(models.Model):
    """Итоги олимпиады за один год — одним куском текста.

    Дробить на модель «участник-призёр» смысла нет: список публикуется
    раз в год целиком и правится копипастом из документа комиссии.
    """

    year = models.PositiveIntegerField('Год', unique=True)
    intro = models.TextField('Вступление', blank=True, default='')
    body_html = models.TextField(
        'Списки победителей и призёров',
        help_text='Можно использовать HTML-теги: <h3>, <ul>, <li>, <b>.',
    )
    is_published = models.BooleanField(
        'Опубликовано',
        default=False,
        help_text='На сайте показывается только самый свежий опубликованный год, '
                  'и только если в настройках включён показ итогов.',
    )

    class Meta:
        verbose_name = 'Итоги олимпиады'
        verbose_name_plural = 'Итоги олимпиад'
        ordering = ['-year']

    def __str__(self):
        return f'Итоги {self.year}'


class PageSeo(models.Model):
    """Заголовки и описания страниц для поисковиков и соцсетей."""

    HOME = 'home'
    WORKSHOPS = 'workshops'
    OLYMPIADS = 'olympiads'
    EXCURSIONS = 'excursions'
    CONTEST = 'contest'

    SLUG_CHOICES = [
        (HOME, 'Главная'),
        (WORKSHOPS, 'Мастер-классы'),
        (OLYMPIADS, 'Олимпиады'),
        (EXCURSIONS, 'Экскурсии'),
        (CONTEST, 'Конкурс рисунков'),
    ]

    slug = models.SlugField('Страница', max_length=32, choices=SLUG_CHOICES, unique=True)
    title = models.CharField('Заголовок (title)', max_length=255)
    description = models.TextField('Описание (description)')
    og_title = models.CharField('Заголовок для соцсетей', max_length=255, blank=True, default='')
    og_description = models.TextField('Описание для соцсетей', blank=True, default='')
    keywords = models.TextField(
        'Ключевые слова',
        blank=True,
        default='',
        help_text='Через запятую.',
    )

    class Meta:
        verbose_name = 'SEO страницы'
        verbose_name_plural = 'SEO страниц'
        ordering = ['slug']

    def __str__(self):
        return self.get_slug_display()
