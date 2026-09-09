from django.urls import path

from . import views

app_name = 'content'

urlpatterns = [
    path('', views.SiteContentView.as_view(), name='site-content'),
]
