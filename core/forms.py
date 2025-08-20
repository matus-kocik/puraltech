from django import forms
from django_recaptcha.fields import ReCaptchaField
from django_recaptcha.widgets import ReCaptchaV2Checkbox

from .validators import (
    validate_human_name,
    validate_email_domain,
    validate_subject,
    validate_message_body,
    validate_plain_text,
)


class ContactForm(forms.Form):
    name = forms.CharField(
        label="Jméno a příjmení",
        max_length=100,
        validators=[validate_human_name],
        widget=forms.TextInput(
            attrs={
                "class": "w-full p-3 border rounded",
                "placeholder": "Jméno a příjmení",
                "maxlength": "100",
                "autocomplete": "name",
                "aria-describedby": "name-error",
            }
        ),
    )

    email = forms.EmailField(
        label="Email",
        max_length=128,
        validators=[validate_email_domain],
        widget=forms.EmailInput(
            attrs={
                "class": "w-full p-3 border rounded",
                "placeholder": "Email",
                "maxlength": "128",
                "autocomplete": "email",
                "aria-describedby": "email-error",
            }
        ),
    )

    subject = forms.CharField(
        label="Předmět",
        max_length=200,
        validators=[validate_subject, validate_plain_text],
        widget=forms.TextInput(
            attrs={
                "class": "w-full p-3 border rounded",
                "placeholder": "Předmět",
                "maxlength": "200",
                "autocomplete": "off",
                "aria-describedby": "subject-error",
            }
        ),
    )

    message = forms.CharField(
        label="Zpráva",
        max_length=1000,
        validators=[validate_message_body, validate_plain_text],
        widget=forms.Textarea(
            attrs={
                "class": "w-full p-3 border rounded",
                "placeholder": "Zpráva",
                "maxlength": "1000",
                "rows": 5,
                "aria-describedby": "message-error",
            }
        ),
    )

    honeypot = forms.CharField(required=False, widget=forms.HiddenInput, label="")
    captcha = ReCaptchaField(widget=ReCaptchaV2Checkbox())

    def clean_honeypot(self):
        if self.cleaned_data.get("honeypot"):
            raise forms.ValidationError("Neplatný pokus o odeslání formuláře.")
        return ""
