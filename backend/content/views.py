from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    OlympiadResult,
    PageSeo,
    Partner,
    ProgramItem,
    RegistrationSection,
    SiteSettings,
    SocialLink,
)
from .serializers import (
    OlympiadResultSerializer,
    PageSeoSerializer,
    PartnerSerializer,
    ProgramItemSerializer,
    RegistrationSectionSerializer,
    SiteSettingsSerializer,
    SocialLinkSerializer,
)


class SiteContentView(APIView):
    """Всё содержимое сайта одним ответом.

    Фронтенд забирает его при серверном рендере и кеширует на минуту (ISR),
    поэтому один увесистый запрос дешевле шести мелких.
    """

    def get(self, request):
        settings_obj = SiteSettings.get_solo()

        sections = {
            section.slug: RegistrationSectionSerializer(section, context={'request': request}).data
            for section in RegistrationSection.objects.all()
        }

        latest_results = (
            OlympiadResult.objects.filter(is_published=True).order_by('-year').first()
        )

        return Response({
            'settings': SiteSettingsSerializer(settings_obj, context={'request': request}).data,
            'registration': sections,
            'program': ProgramItemSerializer(
                ProgramItem.objects.filter(is_visible=True),
                many=True, context={'request': request},
            ).data,
            'partners': PartnerSerializer(
                Partner.objects.filter(is_visible=True),
                many=True, context={'request': request},
            ).data,
            'socials': SocialLinkSerializer(
                SocialLink.objects.filter(is_visible=True),
                many=True, context={'request': request},
            ).data,
            'olympiad_results': (
                OlympiadResultSerializer(latest_results, context={'request': request}).data
                if latest_results else None
            ),
            'seo': {
                page.slug: PageSeoSerializer(page, context={'request': request}).data
                for page in PageSeo.objects.all()
            },
        })
