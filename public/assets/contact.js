(() => {
  "use strict";

  const ENDPOINT = "https://formsubmit.co/ajax/contato@calculadoradeprazo.pro";
  const form = document.querySelector("#contact-form");
  const submitButton = document.querySelector("#contact-submit");
  const status = document.querySelector("#contact-status");
  const fields = {
    nome: document.querySelector("#contact-name"),
    email: document.querySelector("#contact-email"),
    mensagem: document.querySelector("#contact-message")
  };
  let isSubmitting = false;

  document.querySelector("#current-year").textContent = new Date().getFullYear();

  const errors = {
    nome: document.querySelector("#name-error"),
    email: document.querySelector("#email-error"),
    mensagem: document.querySelector("#message-error")
  };

  function setFieldError(name, message = "") {
    errors[name].textContent = message;
    fields[name].setAttribute("aria-invalid", message ? "true" : "false");
  }

  function validate() {
    const nome = fields.nome.value.trim();
    const email = fields.email.value.trim();
    const mensagem = fields.mensagem.value.trim();
    let firstInvalid = null;

    setFieldError("nome", nome ? "" : "Informe seu nome.");
    setFieldError("email", !email
      ? "Informe seu e-mail."
      : fields.email.validity.typeMismatch
        ? "Informe um endereço de e-mail válido."
        : "");
    setFieldError("mensagem", !mensagem
      ? "Escreva sua mensagem."
      : mensagem.length < 10
        ? "A mensagem precisa ter pelo menos 10 caracteres."
        : "");

    for (const name of Object.keys(fields)) {
      if (fields[name].getAttribute("aria-invalid") === "true" && !firstInvalid) {
        firstInvalid = fields[name];
      }
    }
    firstInvalid?.focus();
    return firstInvalid ? null : { nome, email, mensagem };
  }

  function showStatus(type, message) {
    status.className = `contact-status ${type}`;
    status.setAttribute("role", type === "error" ? "alert" : "status");
    status.textContent = message;
    status.hidden = false;
  }

  function setSubmitting(submitting) {
    isSubmitting = submitting;
    submitButton.disabled = submitting;
    submitButton.setAttribute("aria-busy", String(submitting));
    submitButton.querySelector(".button-label").textContent = submitting ? "Enviando…" : "Enviar mensagem";
  }

  fields.mensagem.addEventListener("input", () => {
    document.querySelector("#message-count").textContent = fields.mensagem.value.length;
    if (fields.mensagem.getAttribute("aria-invalid") === "true") setFieldError("mensagem");
  });

  for (const [name, field] of Object.entries(fields)) {
    field.addEventListener("input", () => {
      if (field.getAttribute("aria-invalid") === "true") setFieldError(name);
    });
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (isSubmitting) return;
    status.hidden = true;

    const values = validate();
    if (!values) {
      showStatus("error", "Revise os campos destacados antes de enviar.");
      return;
    }

    if (document.querySelector("#contact-website").value) {
      showStatus("success", "Mensagem enviada. Obrigado pelo contato!");
      form.reset();
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          nome: values.nome,
          email: values.email,
          mensagem: values.mensagem,
          _subject: "Novo contato — Calculadora de Prazo"
        })
      });

      if (!response.ok) {
        throw new Error("Não foi possível enviar a mensagem.");
      }

      const data = await response.json();
      if (String(data.success).toLowerCase() === "false") {
        throw new Error(data.message || "Não foi possível enviar a mensagem.");
      }

      form.reset();
      document.querySelector("#message-count").textContent = "0";
      showStatus("success", "Mensagem enviada com sucesso! Obrigado pelo contato.");
      status.focus?.();
    } catch {
      showStatus("error", "Não foi possível enviar agora. Tente novamente ou escreva para contato@calculadoradeprazo.pro.");
    } finally {
      setSubmitting(false);
    }
  });

  form.dataset.ready = "true";
})();
