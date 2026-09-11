"""Проверки файла с работой.

Вынесены из модели, потому что на них ссылается миграция: менять
подпись функций после выкатки нельзя, иначе миграции перестанут
импортироваться.
"""

import os

from django.core.exceptions import ValidationError

# Расширения, которые принимаем. HEIC и HEIF здесь не случайно:
# айфон снимает в них по умолчанию, и без них часть родителей
# упрётся в ошибку на ровном месте.
ALLOWED_EXTENSIONS = ('.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif')

# 15 МБ. Выше поднимать нельзя, не тронув nginx: на проде стоит
# client_max_body_size 20M, и запрос отвалится с 413 ещё до Django.
MAX_FILE_SIZE = 15 * 1024 * 1024


def validate_artwork_extension(value):
    extension = os.path.splitext(value.name)[1].lower()
    if extension not in ALLOWED_EXTENSIONS:
        raise ValidationError(
            'Такой формат файла мы не принимаем. Подойдут JPG, PNG, WEBP или HEIC.'
        )


def validate_artwork_size(value):
    if value.size > MAX_FILE_SIZE:
        raise ValidationError(
            f'Файл больше {MAX_FILE_SIZE // (1024 * 1024)} МБ. '
            f'Сожмите фото или переснимите его в меньшем разрешении.'
        )
