from django import forms


class ContactForm(forms.Form):
    name = forms.CharField(
        label="Jméno a příjmení",
        max_length=100,
        widget=forms.TextInput(
            attrs={
                "class": "w-full p-3 border rounded",
                "placeholder": "Jméno a příjmení",
            }
        ),
    )
    email = forms.EmailField(
        label="Email",
        widget=forms.EmailInput(
            attrs={"class": "w-full p-3 border rounded", "placeholder": "Email"}
        ),
    )
    subject = forms.CharField(
        label="Předmět",
        max_length=200,
        widget=forms.TextInput(
            attrs={"class": "w-full p-3 border rounded", "placeholder": "Předmět"}
        ),
    )
    message = forms.CharField(
        label="Zpráva",
        widget=forms.Textarea(
            attrs={"class": "w-full p-3 border rounded", "placeholder": "Zpráva"}
        ),
    )
