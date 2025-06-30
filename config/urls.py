from django.contrib import admin
from django.urls import path
from core.views import home_view  # importuj správne view z core appky

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", home_view, name="home"),
]
