from django.urls import path

from . import views

# Имя приложения обязательно: у всех четырёх приложений маршрут называется
# 'participants', и без неймспейса reverse() уводит в соседнее приложение.
app_name = 'workshops'

urlpatterns = [
    path('', views.WorkshopListView.as_view(), name='list'),
    path('participants', views.ParticipantCreateView.as_view(), name='participants'),
]
