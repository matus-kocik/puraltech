// Puraltech – klientská validace kontakt formuláře
(function () {
    const $ = (sel) => document.querySelector(sel);

    const nameInput = $("#id_name");
    const nameError = $("#name-error");

    const emailInput = $("#id_email");
    const emailError = $("#email-error");

    const subjectInput = $("#id_subject");
    const subjectError = $("#subject-error");

    const messageInput = $("#id_message");
    const messageError = $("#message-error");

    const form = nameInput ? nameInput.closest("form") : null;

    if (!form || !nameInput || !emailInput || !subjectInput || !messageInput) return;

    const containsHtmlTags = (text) => /<[^>]+>/.test(text);

    const nameRegex =
        /^[A-Za-zÁÉÍÓÚÝĎŤŇŘŠČŽäëïöüÄËÏÖÜáéíóúýďťňřščž' -]+$/;
    const emailRegex =
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    function validateName() {
        const value = nameInput.value.trim();
        if (value === "") {
            nameError && (nameError.textContent = "");
            return true;
        }
        if (value.length < 2) {
            nameError && (nameError.textContent = "Jméno a příjmení musí mít alespoň 2 znaky.");
            return false;
        }
        if (!nameRegex.test(value)) {
            nameError && (nameError.textContent = "Může obsahovat pouze písmena, mezery, pomlčky nebo apostrof.");
            return false;
        }
        nameError && (nameError.textContent = "");
        return true;
    }

    function validateEmail() {
        const value = emailInput.value.trim();
        if (value === "") {
            emailError && (emailError.textContent = "");
            return true;
        }
        if (!emailRegex.test(value)) {
            emailError && (emailError.textContent = "Zadejte platnou e‑mailovou adresu.");
            return false;
        }
        emailError && (emailError.textContent = "");
        return true;
    }

    function validateSubject() {
        const value = subjectInput.value.trim();
        if (value === "") {
            subjectError && (subjectError.textContent = "");
            return true;
        }
        if (value.length < 3) {
            subjectError && (subjectError.textContent = "Předmět musí mít alespoň 3 znaky.");
            return false;
        }
        if (!/[A-Za-zÁ-Žá-ž]/.test(value)) {
            subjectError && (subjectError.textContent = "Předmět musí obsahovat alespoň jedno písmeno.");
            return false;
        }
        if (containsHtmlTags(value)) {
            subjectError && (subjectError.textContent = "Předmět nesmí obsahovat HTML značky.");
            return false;
        }
        subjectError && (subjectError.textContent = "");
        return true;
    }

    function validateMessage() {
        const value = messageInput.value.trim();
        if (value === "") {
            messageError && (messageError.textContent = "");
            return true;
        }
        if (value.length < 10) {
            messageError && (messageError.textContent = "Zpráva musí mít alespoň 10 znaků.");
            return false;
        }
        if (!/[A-Za-zÁ-Žá-ž]/.test(value)) {
            messageError && (messageError.textContent = "Zpráva musí obsahovat text.");
            return false;
        }
        if (containsHtmlTags(value)) {
            messageError && (messageError.textContent = "Zpráva nesmí obsahovat HTML značky.");
            return false;
        }
        messageError && (messageError.textContent = "");
        return true;
    }

    // Live validace
    nameInput.addEventListener("input", validateName);
    emailInput.addEventListener("input", validateEmail);
    subjectInput.addEventListener("input", validateSubject);
    messageInput.addEventListener("input", validateMessage);

    // Vyčisti chybu, když uživatel odejde a pole je prázdné
    [[nameInput, nameError],
    [emailInput, emailError],
    [subjectInput, subjectError],
    [messageInput, messageError]].forEach(([input, errorEl]) => {
        input.addEventListener("blur", () => {
            if (input.value.trim() === "" && errorEl) errorEl.textContent = "";
        });
    });

    // Blokuj submit, pokud je něco špatně
    form.addEventListener("submit", (e) => {
        const ok =
            validateName() &
            validateEmail() &
            validateSubject() &
            validateMessage();

        if (!ok) {
            e.preventDefault();
            e.stopPropagation();
        }
    });
})();