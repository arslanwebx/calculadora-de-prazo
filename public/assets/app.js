(() => {
  "use strict";

  const form = document.querySelector("#deadline-form");
  const startInput = document.querySelector("#start-date");
  const daysInput = document.querySelector("#days");
  const result = document.querySelector("#result");
  const errorBox = document.querySelector("#form-error");
  const customDates = new Map();
  let lastResultText = "";

  const pad = (number) => String(number).padStart(2, "0");
  const toKey = (date) => `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
  const fromKey = (value) => {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, day));
  };
  const addDay = (date) => new Date(date.getTime() + 86400000);
  const formatLong = (date) => new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit", month: "long", year: "numeric", timeZone: "UTC"
  }).format(date);
  const formatShort = (date) => new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC"
  }).format(date);
  const weekday = (date) => new Intl.DateTimeFormat("pt-BR", {
    weekday: "long", timeZone: "UTC"
  }).format(date);
  const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);

  const today = new Date();
  startInput.value = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
  document.querySelector("#current-year").textContent = today.getFullYear();

  function nationalHoliday(date) {
    const monthDay = `${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
    const holidays = {
      "01-01": "Confraternização Universal",
      "04-21": "Tiradentes",
      "05-01": "Dia do Trabalho",
      "09-07": "Independência do Brasil",
      "10-12": "Nossa Senhora Aparecida",
      "11-02": "Finados",
      "11-15": "Proclamação da República",
      "11-20": "Dia da Consciência Negra",
      "12-25": "Natal"
    };
    return holidays[monthDay] || "";
  }

  function isCourtRecess(date) {
    const month = date.getUTCMonth();
    const day = date.getUTCDate();
    return (month === 11 && day >= 20) || (month === 0 && day <= 20);
  }

  function classify(date, useRecess) {
    const key = toKey(date);
    const weekDay = date.getUTCDay();
    if (customDates.has(key)) return { blocked: true, kind: "paused", reason: customDates.get(key) };
    if (useRecess && isCourtRecess(date)) return { blocked: true, kind: "paused", reason: "Suspensão de prazos (20/12 a 20/01)" };
    const holiday = nationalHoliday(date);
    if (holiday) return { blocked: true, kind: "paused", reason: holiday };
    if (weekDay === 0 || weekDay === 6) return { blocked: true, kind: "weekend", reason: weekDay === 6 ? "Sábado" : "Domingo" };
    return { blocked: false, kind: "business", reason: "Dia útil" };
  }

  function calculate(start, days, mode, useRecess) {
    const entries = [{
      date: start,
      reason: "Termo inicial — excluído",
      status: "skipped",
      number: null
    }];
    let cursor = start;
    let counted = 0;
    let weekends = 0;
    let paused = 0;
    let safety = 0;

    while (counted < days && safety < 4000) {
      cursor = addDay(cursor);
      safety += 1;
      const day = classify(cursor, useRecess);

      if (mode === "business") {
        if (day.blocked) {
          day.kind === "weekend" ? weekends++ : paused++;
          entries.push({ date: cursor, reason: day.reason, status: "skipped", number: null });
        } else {
          counted++;
          entries.push({ date: cursor, reason: "Dia útil", status: "counted", number: counted });
        }
      } else {
        const isSuspension = customDates.has(toKey(cursor)) || (useRecess && isCourtRecess(cursor));
        if (isSuspension) {
          paused++;
          entries.push({ date: cursor, reason: day.reason, status: "skipped", number: null });
        } else {
          counted++;
          if (day.kind === "weekend") weekends++;
          if (day.kind === "paused") paused++;
          entries.push({
            date: cursor,
            reason: day.blocked ? `${day.reason} — computado em dias corridos` : "Dia corrido",
            status: "counted",
            number: counted
          });
        }
      }
    }

    if (mode === "calendar") {
      let terminal = classify(cursor, useRecess);
      while (terminal.blocked && safety < 4000) {
        cursor = addDay(cursor);
        safety += 1;
        terminal = classify(cursor, useRecess);
        if (terminal.blocked) {
          terminal.kind === "weekend" ? weekends++ : paused++;
        }
        entries.push({
          date: cursor,
          reason: terminal.blocked ? terminal.reason + " — vencimento prorrogado" : "Primeiro dia útil após a prorrogação",
          status: terminal.blocked ? "skipped" : "counted",
          number: terminal.blocked ? null : counted
        });
      }
    }

    return { dueDate: cursor, counted, weekends, paused, entries };
  }

  function renderTimeline(entries) {
    const timeline = document.querySelector("#timeline");
    timeline.replaceChildren();
    const fragment = document.createDocumentFragment();

    for (const entry of entries) {
      const row = document.createElement("div");
      row.className = "timeline-row";
      const date = document.createElement("span");
      date.textContent = formatShort(entry.date);
      const reason = document.createElement("span");
      reason.textContent = entry.reason;
      const status = document.createElement("span");
      status.className = `timeline-status ${entry.status}`;
      status.textContent = entry.status === "counted"
        ? (entry.number ? `${entry.number}º dia` : "Vencimento")
        : "Não contado";
      row.append(date, reason, status);
      fragment.append(row);
    }
    timeline.append(fragment);
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    errorBox.hidden = true;
    const days = Number(daysInput.value);

    if (!startInput.value || !Number.isInteger(days) || days < 1 || days > 999) {
      errorBox.textContent = "Informe uma data inicial e um prazo entre 1 e 999 dias.";
      errorBox.hidden = false;
      return;
    }

    const start = fromKey(startInput.value);
    const mode = new FormData(form).get("countMode");
    const useRecess = document.querySelector("#court-recess").checked;
    const calculation = calculate(start, days, mode, useRecess);

    document.querySelector("#result-weekday").textContent = capitalize(weekday(calculation.dueDate));
    document.querySelector("#result-date").textContent = formatLong(calculation.dueDate);
    document.querySelector("#result-summary").textContent =
      `${days} ${mode === "business" ? "dias úteis" : "dias corridos"} a partir de ${formatShort(start)} · dia inicial excluído`;
    document.querySelector("#stat-counted").textContent = calculation.counted;
    document.querySelector("#stat-weekends").textContent = calculation.weekends;
    document.querySelector("#stat-paused").textContent = calculation.paused;
    renderTimeline(calculation.entries);

    lastResultText = `Prazo Fácil: vencimento estimado em ${formatLong(calculation.dueDate)} (${days} ${mode === "business" ? "dias úteis" : "dias corridos"} a partir de ${formatShort(start)}). Confira no calendário oficial do tribunal.`;
    result.hidden = false;
    result.scrollIntoView({ behavior: "smooth", block: "center" });
    document.querySelector("#result-title").focus?.();
  });

  document.querySelector("#case-type").addEventListener("change", (event) => {
    const calendar = document.querySelector("#calendar-days");
    const business = document.querySelector("#business");
    event.target.value === "criminal" || event.target.value === "other"
      ? calendar.checked = true
      : business.checked = true;
  });

  document.querySelector("#add-holiday").addEventListener("click", () => {
    const dateInput = document.querySelector("#custom-holiday");
    const labelInput = document.querySelector("#custom-label");
    if (!dateInput.value) {
      dateInput.focus();
      return;
    }
    customDates.set(dateInput.value, labelInput.value.trim() || "Feriado ou suspensão local");
    renderHolidayChips();
    dateInput.value = "";
    labelInput.value = "";
  });

  function renderHolidayChips() {
    const container = document.querySelector("#holiday-chips");
    container.replaceChildren();
    for (const [date, label] of [...customDates].sort()) {
      const chip = document.createElement("span");
      chip.className = "holiday-chip";
      chip.append(document.createTextNode(`${formatShort(fromKey(date))} · ${label}`));
      const remove = document.createElement("button");
      remove.type = "button";
      remove.setAttribute("aria-label", `Remover ${label} em ${formatShort(fromKey(date))}`);
      remove.textContent = "×";
      remove.addEventListener("click", () => {
        customDates.delete(date);
        renderHolidayChips();
      });
      chip.append(remove);
      container.append(chip);
    }
  }

  document.querySelector("#copy-result").addEventListener("click", async (event) => {
    if (!lastResultText) return;
    try {
      await navigator.clipboard.writeText(lastResultText);
      event.currentTarget.querySelector("span").textContent = "Copiado";
      setTimeout(() => event.currentTarget.querySelector("span").textContent = "Copiar", 1600);
    } catch {
      event.currentTarget.querySelector("span").textContent = "Selecione o texto";
    }
  });

  document.querySelector("#new-calculation").addEventListener("click", () => {
    result.hidden = true;
    startInput.focus();
  });

  document.querySelectorAll(".deadline-card").forEach((card) => {
    card.addEventListener("click", () => {
      daysInput.value = card.dataset.days;
      document.querySelector("#case-type").value = card.dataset.type;
      document.querySelector("#business").checked = true;
      document.querySelector("#calculadora").scrollIntoView({ behavior: "smooth" });
      startInput.focus({ preventScroll: true });
    });
  });

  form.dataset.ready = "true";
})();
