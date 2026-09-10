from rest_framework import serializers


class RelativeFileField(serializers.FileField):
    """URL файла без домена: /media/seed/program/institutes.jpg

    Стандартное поле DRF собирает абсолютный URL из заголовка Host.
    При серверном рендере фронтенд ходит в Django по внутреннему имени
    docker-сети, и в ответ попадал бы адрес http://backend:8000/media/...,
    который браузер разрешить не может.

    Относительный путь работает везде: и сайт, и /media/ отдаются
    с одного домена — на проде это делает nginx, в разработке
    перенаправление в next.config.ts.
    """

    def to_representation(self, value):
        if not value:
            return None
        return value.url
