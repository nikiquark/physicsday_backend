"""Заводит раздел регистрации и SEO для конкурса рисунков.

Данные, а не схема: без этих двух строк страница /contest открылась бы
с закрытой формой и пустыми метатегами.

Это основной путь наполнения. Команда `seed` умеет то же самое, но
запускать её на боевой базе нельзя — плитки «Программы» она ищет
по полю `ordering`, а порядок там давно правили из админки.
"""

from datetime import datetime
from zoneinfo import ZoneInfo

from django.db import migrations

NSK = ZoneInfo('Asia/Novosibirsk')

# Оригиналы рисунков принимают 27 сентября до 13:00 — онлайн-заявки
# закрываются тогда же. Открыто с самого начала: opens_at не задан.
CLOSES_AT = datetime(2026, 9, 27, 13, 0, tzinfo=NSK)

SEO_TITLE = (
    'Конкурс рисунков «Приключения котофизиков в мире науки» | ФизФест НГУ'
)
SEO_DESCRIPTION = (
    'Конкурс детских рисунков о науке на ФизФесте в НГУ. Участники 5–17 лет, '
    'приём работ до 27 сентября 2026. Подайте заявку и приложите фото рисунка.'
)


def create_rows(apps, schema_editor):
    RegistrationSection = apps.get_model('content', 'RegistrationSection')
    PageSeo = apps.get_model('content', 'PageSeo')

    RegistrationSection.objects.get_or_create(
        slug='drawing_contest',
        defaults=dict(
            opens_at=None,
            closes_at=CLOSES_AT,
            closed_title='Приём работ завершён',
            message_after=(
                'Приём работ на конкурс рисунков завершён. '
                'Итоги будут опубликованы на сайте и в сообществе ФизФеста.'
            ),
        ),
    )

    PageSeo.objects.get_or_create(
        slug='contest',
        defaults=dict(
            title=SEO_TITLE,
            description=SEO_DESCRIPTION,
            og_title='Конкурс рисунков «Приключения котофизиков в мире науки»',
            og_description=(
                'Нарисуйте котофизиков в мире науки. Участники 5–17 лет, '
                'приём работ до 27 сентября.'
            ),
            keywords=(
                'конкурс рисунков, детский конкурс, котофизики, ФизФест, НГУ, '
                'Новосибирск, наука для детей'
            ),
        ),
    )


def delete_rows(apps, schema_editor):
    apps.get_model('content', 'RegistrationSection').objects.filter(
        slug='drawing_contest',
    ).delete()
    apps.get_model('content', 'PageSeo').objects.filter(slug='contest').delete()


class Migration(migrations.Migration):

    dependencies = [
        ('content', '0002_alter_pageseo_slug_alter_registrationsection_slug'),
    ]

    operations = [
        migrations.RunPython(create_rows, delete_rows),
    ]
