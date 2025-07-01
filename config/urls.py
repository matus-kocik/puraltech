from django.contrib import admin
from django.urls import path
from core.views import HomeView, AboutView, ServicesView, InfoView, ContactView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", HomeView.as_view(), name="home"),
    path("o-nas/", AboutView.as_view(), name="about"),
    path("sluzby/", ServicesView.as_view(), name="services"),
    path("informace/", InfoView.as_view(), name="info"),
    path("kontakt/", ContactView.as_view(), name="contact"),
]
