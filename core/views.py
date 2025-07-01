# core/views.py
from django.views.generic import FormView, TemplateView
from django.urls import reverse_lazy
from django.core.mail import send_mail
from django.conf import settings
from .forms import ContactForm


class HomeView(FormView):
    template_name = "home.html"
    form_class = ContactForm
    success_url = reverse_lazy("home")

    def form_valid(self, form):
        name = form.cleaned_data["name"]
        email = form.cleaned_data["email"]
        subject = form.cleaned_data["subject"]
        message = form.cleaned_data["message"]

        send_mail(
            subject=f"{subject} od {name}",
            message=message + f"\n\nKontakt: {email}",
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=["matuskocik@gmail.com"],
        )
        return super().form_valid(form)


class ContactView(FormView):
    template_name = "contact.html"
    form_class = ContactForm
    success_url = reverse_lazy("contact")

    def form_valid(self, form):
        name = form.cleaned_data["name"]
        email = form.cleaned_data["email"]
        subject = form.cleaned_data["subject"]
        message = form.cleaned_data["message"]

        send_mail(
            subject=f"{subject} od {name}",
            message=message + f"\n\nKontakt: {email}",
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=["matuskocik@gmail.com"],
        )
        return super().form_valid(form)


class AboutView(TemplateView):
    template_name = "about.html"


class ServicesView(TemplateView):
    template_name = "services.html"


class InfoView(TemplateView):
    template_name = "info.html"

