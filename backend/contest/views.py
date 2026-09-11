from rest_framework import generics
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.throttling import ScopedRateThrottle

from .models import Artwork
from .serializers import ArtworkSerializer


class ArtworkCreateView(generics.CreateAPIView):
    """Приём работ на конкурс.

    Единственная форма сайта, которая кладёт на диск файлы по 15 МБ,
    поэтому здесь стоит ограничение частоты: скрипт с одного адреса
    иначе за ночь забьёт раздел, а на нём же лежат картинки админки.
    От целенаправленной атаки это не спасёт — это страховка от
    случайного цикла.
    """

    queryset = Artwork.objects.all()
    serializer_class = ArtworkSerializer
    parser_classes = [MultiPartParser, FormParser]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'contest_artwork'
