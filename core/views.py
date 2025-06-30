from django.shortcuts import render, redirect
from django.core.mail import send_mail
from django.conf import settings
from .forms import ContactForm


def home_view(request):
    if request.method == "POST":
        form = ContactForm(request.POST)
        if form.is_valid():
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
            return redirect("home")
    else:
        form = ContactForm()

    return render(request, "home.html", {"form": form})
