"""Стартовое наполнение сайта.

Команда идемпотентна: если данные уже есть, она ничего не трогает.
Так её нельзя случайно запустить дважды и затереть правки, сделанные
в админке. Чтобы наполнить заново, сначала очистите таблицы вручную.

    python manage.py seed
    python manage.py seed --force   # перезаписать даже существующие записи
"""

from datetime import date, datetime, time

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from content.models import (
    OlympiadResult,
    PageSeo,
    Partner,
    ProgramItem,
    RegistrationSection,
    SiteSettings,
    SocialLink,
)
from excursions.models import Institute
from workshops.models import Workshop


def nsk(year, month, day, hour=0, minute=0):
    """Новосибирское время в осознанный datetime."""
    return timezone.make_aware(datetime(year, month, day, hour, minute))


PROGRAM = [
    ('Экскурсии в научные институты Академгородка', 'seed/program/institutes.jpg', '/excursions'),
    ('Уникальные физические демонстрации', 'seed/program/dem.jpg', ''),
    ('Встречи с ведущими учеными и экспертами в различных областях физики', 'seed/program/pogosov.jpg', ''),
    ('ФизКвест', 'seed/program/quest.jpg', ''),
    ('Physics Street', 'seed/program/street.jpg', ''),
    ('Мастер-классы', 'seed/program/workshops.jpg', '/masters'),
    ('ФизФест-олимпиады', 'seed/program/olympiads.jpg', '/olympiads'),
    ('Призы и подарки от организаторов', 'seed/program/prizes.jpg', ''),
    ('Конкурс рисунков и постеров «Приключения котофизиков в мире науки»', 'seed/program/cat1.png', ''),
]

PARTNERS = [
    ('ИЯФ СО РАН', 'seed/partners/binp.jpg', 'https://www.inp.nsk.su/'),
    ('ИТПМ СО РАН', 'seed/partners/itpm.jpg', 'https://itam.nsc.ru/'),
    ('ИТ СО РАН', 'seed/partners/it.png', 'http://www.itp.nsc.ru/'),
    ('ИАиЭ СО РАН', 'seed/partners/iae.png', 'https://www.iae.nsk.su/ru/'),
    ('ИФП СО РАН', 'seed/partners/ifp.png', 'https://www.isp.nsc.ru/'),
    ('ИК СО РАН', 'seed/partners/ik.png', 'https://catalysis.ru/'),
    ('ИНХ СО РАН', 'seed/partners/inc.png', 'http://niic.nsc.ru/'),
    ('ИХКГ СО РАН', 'seed/partners/ihkg.png', 'http://www.kinetics.nsc.ru/index.php/ru/'),
    ('МТЦ СО РАН', 'seed/partners/mtc.png', 'https://www.tomo.nsc.ru/'),
    ('СКИФ', 'seed/partners/skif.jpg', 'https://srf-skif.ru/index.php/'),
    ('SoftLab NSK', 'seed/partners/softlab.png', 'https://www.softlab.tv/'),
    ('PetroGM', 'seed/partners/pgm.jpg', 'https://petrogm.com/'),
]

SOCIALS = [
    ('ФизФест в ВК', 'https://vk.ru/ff_fest_nsu'),
    ('Физический Факультет НГУ', 'https://vk.ru/physnsu'),
    ('Абитуриентам ФФ НГУ', 'https://vk.com/ffnsuabiturient'),
]

WORKSHOPS = [
    # название, возраст, время, аудитория, лимит, картинка
    ('Занимательная физика', 'Дошкольники от 5 лет и 1-4 класс', time(12, 45), '315 ГК', 30, 'seed/workshops/zanimatelnaya.jpg'),
    ('Аэродинамика', '5-9 класс', time(12, 45), '321а ГК', 30, 'seed/workshops/aero.jpg'),
    ('Электромагнетизм', '5-9 класс', time(10, 45), '321', 10, 'seed/workshops/elmag.jpg'),
    ('Электростатика', '5-9 класс', time(12, 45), '324', 10, 'seed/workshops/static.jpg'),
    ('Радиоэлектроника', '9-11 класс', time(12, 45), '348', 10, 'seed/workshops/rel.jpg'),
    ('Занимательная физика', 'Дошкольники от 5 лет и 1-4 класс', time(13, 45), '315 ГК', 30, 'seed/workshops/zan.jpg'),
]

INSTITUTES = [
    # название, адрес, дата и время, лимит, картинка
    ('Институт Ядерной Физики', 'пр. Академика Лаврентьева, 11', nsk(2026, 10, 3, 11, 0), 150, 'seed/institutes/binp.jpg'),
    ('Институт теоретической и прикладной механики', 'ул. Институтская, 4/1', nsk(2026, 10, 3, 12, 0), 150, 'seed/institutes/itpm.jpg'),
    ('Институт химической биологии и фундаментальной медицины', 'Лаврентьева, 8', nsk(2026, 10, 3, 11, 0), 150, 'default_logo.jpg'),
]

SEO = [
    ('home',
     'ФизФест 2026 НГУ | День Физики в НГУ | Фестиваль науки для школьников 27 сентября',
     'ФизФест 2026 в НГУ Новосибирск — фестиваль физики для школьников. Мастер-классы, олимпиады, научные эксперименты. Регистрация открыта!',
     'ФизФест 2026 - Фестиваль науки НГУ',
     'Мастер-классы, олимпиады, научные эксперименты для школьников в НГУ',
     'физфест, день физики, НГУ, Новосибирск, фестиваль науки, олимпиады по физике, мастер-классы, регистрация на фестиваль'),
    ('workshops',
     'Мастер-классы по физике для школьников | ФизФест 2026 | НГУ Новосибирск',
     'Практические мастер-классы по физике на ФизФест 2026. Эксперименты, опыты, научные демонстрации для школьников всех классов. Бесплатная регистрация в НГУ.',
     'Мастер-классы по физике | ФизФест 2026 НГУ',
     'Практические занятия с экспертами физики. Регистрация откроется 14 сентября.',
     'мастер-классы по физике, эксперименты, опыты, НГУ, ФизФест 2026'),
    ('olympiads',
     'Олимпиады по физике для школьников 1-11 классов | ФизФест 2026 | НГУ Новосибирск',
     'Олимпиады по физике на ФизФест 2026 для школьников 1-11 классов. Соревнования, призы, дипломы. Регистрация до 7 октября в НГУ Новосибирск.',
     'Олимпиады по физике | ФизФест 2026 НГУ',
     'Олимпиады по физике для школьников 1-11 классов. Регистрация до 10:00 7 октября!',
     'олимпиада по физике, школьники, НГУ, ФизФест 2026, дистанционная олимпиада'),
    ('excursions',
     'Экскурсии в научные институты | ФизФест 2026 | НГУ Новосибирск',
     'Экскурсии в ведущие научные институты на ФизФест 2026. Посетите лаборатории, познакомьтесь с современными исследованиями.',
     'Экскурсии в научные институты | ФизФест 2026 НГУ',
     'Экскурсии в институты Академгородка. Регистрация откроется 14 сентября.',
     'экскурсии, научные институты, Академгородок, ИЯФ, ИТПМ, ИХБФМ, ФизФест 2026'),
]

RESULTS_2025_HTML = """
<h3>🥇 1 место ПОБЕДИТЕЛИ</h3>
<h4>🔹️ 1-4 классы</h4>
<ul><li>Бердюгин Михаил</li><li>Горшкова Вероника</li><li>Корниенко Георгий</li><li>Минаев Роман</li><li>Петросян Тарон</li><li>Пилюгина Виктория</li><li>Стефанов Тимофей</li></ul>
<h4>🔹️ 5-7 классы</h4>
<ul><li>Ермоленко Михаил</li><li>Таранец Всеволод</li></ul>
<h4>🔹️ 8-9 классы</h4>
<ul><li>Сарапкин Александр</li><li>Трясак Семён</li><li>Шувалов Артём</li></ul>

<h3>🥈 2 место ПРИЗЁРЫ</h3>
<h4>🔹️ 1-4 классы</h4>
<ul><li>Волков Виктор</li><li>Ефременко Тарас</li><li>Калугина Светлана</li><li>Пирожков Борис</li><li>Репнёв Иван</li><li>Сизов Роман</li><li>Уфимцев Дмитрий</li><li>Шевченко Артём</li></ul>
<h4>🔹️ 5-7 классы</h4>
<ul><li>Баранов Фёдор</li><li>Батуков Иван</li><li>Васильев Дмитрий</li><li>Габов Петр</li><li>Герасимов Максим</li><li>Зайвий Таисия</li><li>Захаров Савелий</li><li>Костылев Кирилл</li></ul>
<h4>🔹️ 8-9 классы</h4>
<ul><li>Антонович Михаил</li><li>Титов Степан</li><li>Цветко Евгений</li></ul>
<h4>🔹️ 10-11 классы</h4>
<ul><li>Беляев Егор</li><li>Куртубашев Артём</li><li>Матвеев Ярослав</li></ul>

<h3>🥉 3 место ПРИЗЁРЫ</h3>
<h4>🔹️ 5-7 классы</h4>
<ul><li>Багинский Андрей</li><li>Гуревич Максим</li><li>Иванов Александр</li><li>Иванов Андрей</li><li>Калмыкова Вероника</li><li>Маркус Фёдор</li><li>Мингулова Екатерина</li><li>Скворцов Тимофей</li></ul>
<h4>🔹️ 8-9 классы</h4>
<ul><li>Кириллова Диана</li><li>Никулин Никита</li><li>Сопотов Михаил</li></ul>

<p>Поздравляем победителей и призеров ФизФест-олимпиады, а также благодарим всех,
кто принял участие в решении олимпиадных задач.</p>
""".strip()

AWARDS_2025_HTML = """
<p><strong>14 ноября 2025</strong>, <strong>16:00</strong></p>
<p><strong>Новосибирский государственный университет</strong><br/>
ул. Пирогова, 2, аудитория 317а</p>
<p>Победители и призёры ФизФест-олимпиады, будем рады видеть вас на церемонии!</p>
""".strip()


class Command(BaseCommand):
    help = 'Наполняет пустую базу стартовым содержимым сайта и каталогом мероприятий.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Перезаписать записи, даже если они уже есть. Правки из админки будут потеряны.',
        )

    @transaction.atomic
    def handle(self, *args, **options):
        force = options['force']
        self.created = 0
        self.skipped = 0

        self.seed_settings(force)
        self.seed_registration_sections(force)
        self.seed_program(force)
        self.seed_partners(force)
        self.seed_socials(force)
        self.seed_seo(force)
        self.seed_results(force)
        self.seed_workshops(force)
        self.seed_institutes(force)

        self.stdout.write(self.style.SUCCESS(
            f'Готово. Создано записей: {self.created}, пропущено (уже были): {self.skipped}.'
        ))
        if self.skipped and not force:
            self.stdout.write(
                'Существующие записи не тронуты. Чтобы перезаписать их, '
                'запустите команду с флагом --force.'
            )

    # ── помощники ───────────────────────────────────────────────────────
    def upsert(self, model, lookup, defaults, force):
        obj = model.objects.filter(**lookup).first()
        if obj is None:
            model.objects.create(**lookup, **defaults)
            self.created += 1
        elif force:
            for field, value in defaults.items():
                setattr(obj, field, value)
            obj.save()
            self.created += 1
        else:
            self.skipped += 1

    # ── разделы ─────────────────────────────────────────────────────────
    def seed_settings(self, force):
        exists = SiteSettings.objects.exists()
        if exists and not force:
            self.skipped += 1
            return
        settings_obj = SiteSettings.get_solo()
        settings_obj.event_date = date(2026, 9, 27)
        settings_obj.event_time = time(11, 0)
        settings_obj.event_place = 'Главный корпус НГУ (Пирогова, 2)'
        settings_obj.olympiad_dates = '10 — 12 октября 2026'
        settings_obj.olympiad_format = 'дистанционный'
        settings_obj.olympiad_results_date = 'не позднее 2 ноября 2026'
        # Итогов 2026 года ещё нет, поэтому кнопка, список победителей
        # и блок про церемонию скрыты до ноября.
        settings_obj.show_olympiad_results = False
        settings_obj.show_awards_ceremony = False
        settings_obj.awards_ceremony_html = AWARDS_2025_HTML
        settings_obj.save()
        self.created += 1

    def seed_registration_sections(self, force):
        sections = [
            # ФизФест — открыт: регистрацию просили открыть сразу.
            (RegistrationSection.PHYSICSDAY, dict(
                opens_at=None, closes_at=None,
                message_after='Регистрация на ФизФест завершена. Следите за обновлениями на нашем сайте.',
            )),
            (RegistrationSection.WORKSHOPS, dict(
                opens_at=nsk(2026, 9, 14, 0, 0), closes_at=None,
                message_before='Регистрация на мастер-классы откроется 14 сентября.',
                message_after='Регистрация на мастер-классы завершена. Следите за обновлениями на нашем сайте.',
            )),
            (RegistrationSection.EXCURSIONS, dict(
                opens_at=nsk(2026, 9, 14, 0, 0), closes_at=None,
                message_before='Регистрация на экскурсии откроется 14 сентября.',
                message_after='Регистрация на экскурсии завершена. Следите за обновлениями на нашем сайте.',
            )),
            # Олимпиады — приём заявок до 10:00 7 октября по Новосибирску.
            (RegistrationSection.OLYMPIADS, dict(
                opens_at=None, closes_at=nsk(2026, 10, 7, 10, 0),
                message_after='Регистрация на олимпиады завершена. Следите за обновлениями на нашем сайте.',
            )),
        ]
        for slug, defaults in sections:
            self.upsert(RegistrationSection, {'slug': slug}, defaults, force)

    def seed_program(self, force):
        for index, (title, image, href) in enumerate(PROGRAM, start=1):
            self.upsert(
                ProgramItem, {'ordering': index},
                {'title': title, 'image': image, 'href': href, 'is_visible': True},
                force,
            )

    def seed_partners(self, force):
        for index, (name, logo, website) in enumerate(PARTNERS, start=1):
            self.upsert(
                Partner, {'name': name},
                {'logo': logo, 'website': website, 'ordering': index, 'is_visible': True},
                force,
            )

    def seed_socials(self, force):
        for index, (title, url) in enumerate(SOCIALS, start=1):
            self.upsert(SocialLink, {'title': title}, {'url': url, 'ordering': index}, force)

    def seed_seo(self, force):
        for slug, title, description, og_title, og_description, keywords in SEO:
            self.upsert(
                PageSeo, {'slug': slug},
                {
                    'title': title, 'description': description,
                    'og_title': og_title, 'og_description': og_description,
                    'keywords': keywords,
                },
                force,
            )

    def seed_results(self, force):
        self.upsert(
            OlympiadResult, {'year': 2025},
            {
                'intro': 'Дорогие друзья! Экспертная комиссия завершила проверку работ '
                         'ФизФест-олимпиады, и мы с радостью сообщаем вам результаты.',
                'body_html': RESULTS_2025_HTML,
                # Прошлогодний список сохранён, но с сайта убран.
                'is_published': False,
            },
            force,
        )

    def seed_workshops(self, force):
        for index, (name, restriction, start, room, limit, image) in enumerate(WORKSHOPS, start=1):
            self.upsert(
                Workshop, {'name': name, 'time': start},
                {
                    'restriction': restriction, 'room': room, 'limit': limit,
                    'ordering': index, 'image': image,
                },
                force,
            )

    def seed_institutes(self, force):
        for index, (name, address, starts_at, limit, image) in enumerate(INSTITUTES, start=1):
            self.upsert(
                Institute, {'name': name},
                {
                    'address': address, 'starts_at': starts_at, 'limit': limit,
                    'ordering': index, 'image': image,
                },
                force,
            )
