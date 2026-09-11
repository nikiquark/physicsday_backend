from rest_framework import serializers

from content.models import RegistrationSection
from content.registration import RegistrationWindowMixin, normalize_email, normalize_name

from .models import Artwork


class ArtworkSerializer(RegistrationWindowMixin, serializers.ModelSerializer):
    registration_slug = RegistrationSection.DRAWING_CONTEST

    class Meta:
        model = Artwork
        fields = [
            'id', 'author_name', 'age', 'city', 'school', 'class_number',
            'title', 'parent_name', 'email', 'phone', 'photo',
            'publication_consent',
        ]
        # Файл только принимаем: в ответе он превратился бы в ссылку
        # с внутренним адресом docker-сети, а браузеру она не нужна.
        extra_kwargs = {'photo': {'write_only': True}}

    def validate_publication_consent(self, value):
        # Работы уезжают на выставку и в соцсети, поэтому согласие
        # сохраняется вместе с заявкой, а не остаётся галочкой в браузере.
        if not value:
            raise serializers.ValidationError(
                'Без согласия на публикацию работу принять не получится.'
            )
        return value

    def validate(self, attrs):
        """Одна работа от одного автора. Возраст при этом не ограничиваем."""
        attrs = super().validate(attrs)

        exists = Artwork.objects.filter(
            name_norm=normalize_name(attrs.get('author_name')),
            email_norm=normalize_email(attrs.get('email')),
        ).exists()
        if exists:
            raise serializers.ValidationError({
                'non_field_errors': [
                    'Вы уже подали работу на конкурс. '
                    'От одного автора принимается одна работа.'
                ],
            })
        return attrs
