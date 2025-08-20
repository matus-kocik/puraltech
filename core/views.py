from django.conf import settings
from django.contrib import messages
from django.views.generic import FormView, TemplateView
from django.urls import reverse_lazy
from django.core.mail import EmailMultiAlternatives
from django.utils.decorators import method_decorator
from django_ratelimit.decorators import ratelimit
from django.template.loader import render_to_string

from .forms import ContactForm


def _send_contact_emails(request, data):
    # admin email
    html_content = render_to_string("contact_email.html", data)
    msg = EmailMultiAlternatives(
        subject=f"{data['subject']} – zpráva z webu",
        body="",
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[settings.CONTACT_RECEIVER_EMAIL],
        reply_to=[data["email"]],
    )
    msg.attach_alternative(html_content, "text/html")
    msg.send()

    # user email
    user_html = render_to_string("contact_user_email.html", data)
    user_txt = render_to_string("contact_user_email.txt", data)
    user_msg = EmailMultiAlternatives(
        subject="Potvrzení – zpráva z kontaktního formuláře",
        body=user_txt,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[data["email"]],
    )
    user_msg.attach_alternative(user_html, "text/html")
    user_msg.send()


@method_decorator(
    ratelimit(key="post:email", rate="3/h", method="POST", block=True),
    name="dispatch",
)
@method_decorator(
    ratelimit(key="ip", rate="10/h", method="POST", block=True),
    name="dispatch",
)
class ContactView(FormView):
    template_name = "contact.html"
    form_class = ContactForm
    success_url = reverse_lazy("contact")

    def form_valid(self, form):
        data = form.cleaned_data
        _send_contact_emails(self.request, data)
        messages.success(self.request, "Zpráva byla úspěšně odeslána. Děkujeme!")
        return super().form_valid(form)


@method_decorator(
    ratelimit(key="post:email", rate="3/h", method="POST", block=True),
    name="dispatch",
)
@method_decorator(
    ratelimit(key="ip", rate="10/h", method="POST", block=True),
    name="dispatch",
)
class HomeView(FormView):
    template_name = "home.html"
    form_class = ContactForm
    success_url = reverse_lazy("home")

    def form_valid(self, form):
        data = form.cleaned_data
        _send_contact_emails(self.request, data)
        messages.success(self.request, "Zpráva byla úspěšně odeslána. Děkujeme!")
        return super().form_valid(form)


class AboutView(TemplateView):
    template_name = "about.html"


class ServicesView(TemplateView):
    template_name = "services.html"


class InfoView(TemplateView):
    template_name = "info.html"
