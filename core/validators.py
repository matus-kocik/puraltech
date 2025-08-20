import os
import re
from django.core.exceptions import ValidationError

# --- MX kontrola je voliteľná (ak nemáš dnspython, nič sa nerozbije) ---
try:
    import dns.resolver  # type: ignore

    _DNS_AVAILABLE = True
except Exception:
    _DNS_AVAILABLE = False

# Cesty k allow/block listom (keď neexistujú, validator ich ignoruje)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BLOCKLIST_PATH = os.path.join(
    BASE_DIR, "core", "utils", "disposable_email_blocklist.conf"
)
ALLOWLIST_PATH = os.path.join(BASE_DIR, "core", "utils", "allowlist.conf")


def _load_domain_list(path: str) -> set[str]:
    try:
        with open(path, encoding="utf-8") as f:
            return {
                line.strip().lower()
                for line in f
                if line.strip() and not line.startswith("#")
            }
    except FileNotFoundError:
        return set()


BLOCKED_DOMAINS = _load_domain_list(BLOCKLIST_PATH)
ALLOWED_DOMAINS = _load_domain_list(ALLOWLIST_PATH)


# =========================
#   VALIDÁTORY Puraltech
# =========================


def validate_human_name(value: str):
    """Jméno a příjmení – len písmená (CZ/SK), medzery, pomlčka, apostrof; min 2 znaky."""
    value = value.strip()
    if len(value) < 2:
        raise ValidationError("Toto pole musí mít alespoň 2 znaky.")
    if not re.match(r"^[A-Za-zÁÉÍÓÚÝĎŤŇŘŠČŽäëïöüÄËÏÖÜáéíóúýďťňřščž' -]+$", value):
        raise ValidationError(
            "Může obsahovat pouze písmena, mezery, pomlčky nebo apostrof."
        )


def validate_email_domain(value: str):
    """Email – allowlist má vždy přednost; blocklist blokuje; volitelně MX kontrola."""
    domain = value.split("@")[-1].lower()

    if domain in ALLOWED_DOMAINS:
        return

    if domain in BLOCKED_DOMAINS:
        raise ValidationError("Tato doména e-mailu není povolena (např. jednorázová).")

    if _DNS_AVAILABLE:
        try:
            dns.resolver.resolve(domain, "MX")
        except dns.resolver.NXDOMAIN:
            raise ValidationError("Doména e-mailu neexistuje.")
        except dns.resolver.NoAnswer:
            raise ValidationError("Doména e-mailu nemá platný MX záznam.")
        except dns.resolver.NoNameservers:
            raise ValidationError("Doména e-mailu nemá DNS záznamy.")
        except Exception:
            # Nechceme zbytočne padať na dočasných DNS chybách
            raise ValidationError("Nelze ověřit e-mailovou doménu.")


def validate_subject(value: str):
    """Předmět – min 3 znaky, musí obsahovať aspoň jedno písmeno."""
    value = value.strip()
    if len(value) < 3:
        raise ValidationError("Předmět musí mít alespoň 3 znaky.")
    if not re.search(r"[A-Za-zÁ-Žá-ž]", value):
        raise ValidationError("Předmět musí obsahovat alespoň jedno písmeno.")


def validate_message_body(value: str):
    """Zpráva – min 10 znakov a musí obsahovať písmená (t. j. nie len čísla/znaky)."""
    if len(value.strip()) < 10:
        raise ValidationError("Zpráva musí mít alespoň 10 znaků.")
    if not any(c.isalpha() for c in value):
        raise ValidationError("Zpráva musí obsahovat text.")


def validate_plain_text(value: str):
    """Základná sanitácia – žiadne HTML tagy a typické nebezpečné patterny."""
    if re.search(r"<[^>]+>", value):
        raise ValidationError("Text nesmí obsahovat HTML značky.")

    dangerous = [
        r"(javascript:)",
        r"(<script\b)",
        r"(<iframe\b)",
        r"(<object\b)",
        r"(<embed\b)",
        r"(<style\b)",
        r"(<link\b)",
    ]
    for pat in dangerous:
        if re.search(pat, value, re.IGNORECASE):
            raise ValidationError("Text obsahuje nepovolený nebo nebezpečný obsah.")
    return value
