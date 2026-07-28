(() => {
  "use strict";

  const form = document.querySelector("#deadline-form");
  const startInput = document.querySelector("#start-date");
  const daysInput = document.querySelector("#days");
  const stateSelect = document.querySelector("#state");
  const municipalitySearch = document.querySelector("#municipality-search");
  const municipalityInput = document.querySelector("#municipality");
  const municipalityList = document.querySelector("#municipality-list");
  const matterSelect = document.querySelector("#case-type");
  const processSelect = document.querySelector("#process-type");
  const courtSelect = document.querySelector("#court");
  const result = document.querySelector("#result");
  const errorBox = document.querySelector("#form-error");
  const holidayData = window.PRAZO_HOLIDAYS || { national: [], state: {}, municipalities: {} };

  let municipalitiesByState = {};
  let tribunalsByState = {};
  let currentMunicipalities = [];
  let filteredMunicipalities = [];
  let activeMunicipalityIndex = -1;
  let selectedMunicipalityName = "";
  let lastResultText = "";
  let lastCalculation = null;
  let dataReady = false;

  const pad = (number) => String(number).padStart(2, "0");
  const toKey = (date) => `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
  const fromKey = (value) => {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, day));
  };
  const addDays = (date, amount) => new Date(date.getTime() + amount * 86400000);
  const addDay = (date) => addDays(date, 1);
  const normalize = (value) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const selectedText = (select) => select.options[select.selectedIndex]?.text || "";
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

  async function initializeData() {
    try {
      const [municipalityResponse, tribunalResponse] = await Promise.all([
        fetch("/assets/data/municipalities.json"),
        fetch("/assets/data/tribunals.json")
      ]);
      if (!municipalityResponse.ok || !tribunalResponse.ok) throw new Error("Data request failed");
      [municipalitiesByState, tribunalsByState] = await Promise.all([
        municipalityResponse.json(),
        tribunalResponse.json()
      ]);
      dataReady = true;
      municipalitySearch.placeholder = "Selecione o estado primeiro";
      form.dataset.ready = "true";
    } catch {
      errorBox.textContent = "Não foi possível carregar a base de municípios e tribunais. Atualize a página para tentar novamente.";
      errorBox.hidden = false;
      form.dataset.ready = "error";
    }
  }

  function resetSelect(select, placeholder) {
    select.replaceChildren(new Option(placeholder, ""));
    select.value = "";
    select.disabled = true;
  }

  function resetMunicipality() {
    municipalityInput.value = "";
    municipalitySearch.value = "";
    selectedMunicipalityName = "";
    currentMunicipalities = [];
    filteredMunicipalities = [];
    municipalityList.hidden = true;
    municipalitySearch.setAttribute("aria-expanded", "false");
    resetSelect(courtSelect, "Selecione estado e município...");
  }

  stateSelect.addEventListener("change", () => {
    resetMunicipality();
    const state = stateSelect.value;
    if (!state || !dataReady) {
      municipalitySearch.disabled = true;
      municipalitySearch.placeholder = dataReady ? "Selecione o estado primeiro" : "Carregando municípios...";
      document.querySelector("#municipality-help").textContent = "Base oficial completa do IBGE";
      return;
    }
    currentMunicipalities = municipalitiesByState[state] || [];
    municipalitySearch.disabled = false;
    municipalitySearch.placeholder = "Digite para buscar...";
    document.querySelector("#municipality-help").textContent =
      `${currentMunicipalities.length.toLocaleString("pt-BR")} municípios disponíveis em ${selectedText(stateSelect)}`;
  });

  function renderMunicipalities(query = "") {
    const normalizedQuery = normalize(query.trim());
    filteredMunicipalities = currentMunicipalities
      .filter((municipality) => !normalizedQuery || normalize(municipality.name).includes(normalizedQuery))
      .slice(0, 80);
    activeMunicipalityIndex = filteredMunicipalities.length ? 0 : -1;
    municipalityList.replaceChildren();

    if (!filteredMunicipalities.length) {
      const empty = document.createElement("div");
      empty.className = "combobox-empty";
      empty.textContent = "Nenhum município encontrado";
      municipalityList.append(empty);
    } else {
      const fragment = document.createDocumentFragment();
      filteredMunicipalities.forEach((municipality, index) => {
        const option = document.createElement("button");
        option.type = "button";
        option.className = `combobox-option${index === activeMunicipalityIndex ? " active" : ""}`;
        option.id = `municipality-option-${municipality.id}`;
        option.setAttribute("role", "option");
        option.setAttribute("aria-selected", String(index === activeMunicipalityIndex));
        option.dataset.index = String(index);
        option.append(document.createTextNode(municipality.name));
        const code = document.createElement("small");
        code.textContent = `IBGE ${municipality.id}`;
        option.append(code);
        option.addEventListener("mousedown", (event) => event.preventDefault());
        option.addEventListener("click", () => chooseMunicipality(municipality));
        fragment.append(option);
      });
      municipalityList.append(fragment);
    }

    municipalityList.hidden = false;
    municipalitySearch.setAttribute("aria-expanded", "true");
    updateActiveMunicipality();
  }

  function updateActiveMunicipality() {
    const options = [...municipalityList.querySelectorAll(".combobox-option")];
    options.forEach((option, index) => {
      const active = index === activeMunicipalityIndex;
      option.classList.toggle("active", active);
      option.setAttribute("aria-selected", String(active));
      if (active) {
        municipalitySearch.setAttribute("aria-activedescendant", option.id);
        option.scrollIntoView({ block: "nearest" });
      }
    });
    if (activeMunicipalityIndex < 0) municipalitySearch.removeAttribute("aria-activedescendant");
  }

  function chooseMunicipality(municipality) {
    municipalityInput.value = String(municipality.id);
    municipalitySearch.value = municipality.name;
    selectedMunicipalityName = municipality.name;
    municipalityList.hidden = true;
    municipalitySearch.setAttribute("aria-expanded", "false");
    municipalitySearch.removeAttribute("aria-activedescendant");
    loadTribunals();
    municipalitySearch.closest(".field").classList.remove("field-invalid");
  }

  function loadTribunals() {
    courtSelect.replaceChildren(new Option("Selecione...", ""));
    for (const tribunal of tribunalsByState[stateSelect.value] || []) {
      courtSelect.add(new Option(tribunal.name, tribunal.id));
    }
    courtSelect.disabled = courtSelect.options.length <= 1;
  }

  municipalitySearch.addEventListener("focus", () => {
    if (currentMunicipalities.length) renderMunicipalities(municipalitySearch.value === selectedMunicipalityName ? "" : municipalitySearch.value);
  });

  municipalitySearch.addEventListener("input", () => {
    if (municipalitySearch.value !== selectedMunicipalityName) {
      municipalityInput.value = "";
      selectedMunicipalityName = "";
      resetSelect(courtSelect, "Selecione o município...");
    }
    renderMunicipalities(municipalitySearch.value);
  });

  municipalitySearch.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (municipalityList.hidden) renderMunicipalities(municipalitySearch.value);
      const direction = event.key === "ArrowDown" ? 1 : -1;
      activeMunicipalityIndex = Math.max(0, Math.min(filteredMunicipalities.length - 1, activeMunicipalityIndex + direction));
      updateActiveMunicipality();
    } else if (event.key === "Enter" && !municipalityList.hidden && activeMunicipalityIndex >= 0) {
      event.preventDefault();
      chooseMunicipality(filteredMunicipalities[activeMunicipalityIndex]);
    } else if (event.key === "Escape") {
      municipalityList.hidden = true;
      municipalitySearch.setAttribute("aria-expanded", "false");
    }
  });

  municipalitySearch.addEventListener("blur", () => {
    window.setTimeout(() => {
      municipalityList.hidden = true;
      municipalitySearch.setAttribute("aria-expanded", "false");
      if (!municipalityInput.value && municipalitySearch.value) municipalitySearch.value = "";
    }, 120);
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest("#municipality-combobox")) {
      municipalityList.hidden = true;
      municipalitySearch.setAttribute("aria-expanded", "false");
    }
  });

  matterSelect.addEventListener("change", () => {
    document.querySelector(matterSelect.value === "criminal" ? "#calendar-days" : "#business").checked = true;
  });

  function easterSunday(year) {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(Date.UTC(year, month - 1, day));
  }

  function movableCourtDate(date, federalCourt) {
    const easter = easterSunday(date.getUTCFullYear());
    const dates = [
      [addDays(easter, -48), "Segunda-feira de Carnaval"],
      [addDays(easter, -47), "Terça-feira de Carnaval"],
      [addDays(easter, -2), "Paixão de Cristo"],
      [addDays(easter, 60), "Corpus Christi"]
    ];
    if (federalCourt) {
      dates.push(
        [addDays(easter, -4), "Quarta-feira da Semana Santa — Justiça Federal"],
        [addDays(easter, -3), "Quinta-feira da Semana Santa — Justiça Federal"]
      );
    }
    return new Map(dates.map(([holidayDate, name]) => [toKey(holidayDate), name])).get(toKey(date)) || "";
  }

  function holidayFromEntries(date, entries, scope) {
    const monthDay = `${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
    const match = entries.find((entry) => entry.date === monthDay);
    return match ? { name: match.name, scope, legalBasis: match.legalBasis } : null;
  }

  function automaticHoliday(date, options) {
    const national = holidayFromEntries(date, holidayData.national, "nacional");
    if (national) return national;
    const stateHoliday = holidayFromEntries(date, holidayData.state[options.stateCode] || [], "estadual");
    if (stateHoliday) return stateHoliday;
    const municipalityKey = `${options.municipality}|${options.stateCode}`;
    const municipalHoliday = holidayFromEntries(date, holidayData.municipalities[municipalityKey] || [], "municipal");
    if (municipalHoliday) return municipalHoliday;

    if (options.stateCode === "ES" && toKey(date) === toKey(addDays(easterSunday(date.getUTCFullYear()), 8))) {
      return { name: "Nossa Senhora da Penha", scope: "estadual", legalBasis: "Lei estadual 11.010/2019" };
    }
    return null;
  }

  function federalCourtHoliday(date) {
    const monthDay = `${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
    return {
      "08-11": "Criação dos cursos jurídicos — Justiça Federal",
      "11-01": "Todos os Santos — Justiça Federal",
      "12-08": "Dia da Justiça — Justiça Federal"
    }[monthDay] || "";
  }

  function isCourtRecess(date) {
    const month = date.getUTCMonth();
    const day = date.getUTCDate();
    return (month === 11 && day >= 20) || (month === 0 && day <= 20);
  }

  function classify(date, options) {
    const weekDay = date.getUTCDay();
    if (options.useRecess && isCourtRecess(date)) {
      return {
        blocked: true,
        kind: "suspension",
        reason: "Suspensão legal dos prazos (20/12 a 20/01)",
        suspendsContinuous: true,
        source: options.matter === "criminal"
          ? "CPP, art. 798-A"
          : (options.matter === "labor" ? "CNJ, Resolução 244/2016" : "CPC, art. 220")
      };
    }
    if (options.useCommonDates) {
      const commonDate = movableCourtDate(date, options.federalCourt);
      if (commonDate) {
        return {
          blocked: true,
          kind: "court-closure",
          reason: `${commonDate} — sem expediente presumido`,
          suspendsContinuous: false,
          source: options.federalCourt ? "Lei 5.010/1966 e calendário forense" : "Calendário forense a confirmar"
        };
      }
    }
    if (options.federalCourt) {
      const courtHoliday = federalCourtHoliday(date);
      if (courtHoliday) {
        return { blocked: true, kind: "court-closure", reason: courtHoliday, suspendsContinuous: false, source: "Lei 5.010/1966, art. 62" };
      }
    }
    const holiday = automaticHoliday(date, options);
    if (holiday) {
      return {
        blocked: true,
        kind: "holiday",
        reason: `${holiday.name} — feriado ${holiday.scope}`,
        suspendsContinuous: false,
        source: holiday.legalBasis
      };
    }
    if (weekDay === 0 || weekDay === 6) {
      return { blocked: true, kind: "weekend", reason: weekDay === 6 ? "Sábado" : "Domingo", suspendsContinuous: false, source: "" };
    }
    return { blocked: false, kind: "business", reason: "Dia útil", suspendsContinuous: false, source: "" };
  }

  function calculate(start, days, mode, options) {
    const entries = [{ date: start, reason: "Termo inicial informado — excluído da contagem", status: "initial", number: null, source: "CPC, art. 224; CLT, art. 775; CPP, art. 798, § 1º" }];
    let cursor = start;
    let counted = 0;
    let excludedWeekends = 0;
    let excludedHolidays = 0;
    let excludedSuspensions = 0;
    let safety = 0;

    while (counted < days && safety < 4000) {
      cursor = addDay(cursor);
      safety++;
      const day = classify(cursor, options);

      if (mode === "business") {
        if (day.blocked) {
          if (day.kind === "weekend") excludedWeekends++;
          else if (day.kind === "suspension") excludedSuspensions++;
          else excludedHolidays++;
          entries.push({ date: cursor, reason: day.reason, status: "excluded", number: null, source: day.source });
        } else {
          counted++;
          entries.push({ date: cursor, reason: "Dia útil computado", status: "counted", number: counted, source: "" });
        }
      } else if (day.suspendsContinuous) {
        excludedSuspensions++;
        entries.push({ date: cursor, reason: day.reason, status: "excluded", number: null, source: day.source });
      } else {
        counted++;
        entries.push({
          date: cursor,
          reason: day.blocked ? `${day.reason} — computado por ser prazo contínuo` : "Dia corrido computado",
          status: "counted",
          number: counted,
          source: day.source
        });
      }
    }

    if (mode === "calendar") {
      let terminal = classify(cursor, options);
      while (terminal.blocked && safety < 4000) {
        if (entries.at(-1)?.date.getTime() === cursor.getTime()) {
          entries.at(-1).reason += " — vencimento indisponível, prorrogado";
          entries.at(-1).status = "extended";
          entries.at(-1).number = counted;
        }
        cursor = addDay(cursor);
        safety++;
        terminal = classify(cursor, options);
        if (terminal.blocked) {
          if (terminal.kind === "weekend") excludedWeekends++;
          else if (terminal.kind === "suspension") excludedSuspensions++;
          else excludedHolidays++;
        }
        entries.push({
          date: cursor,
          reason: terminal.blocked ? `${terminal.reason} — prorrogação continua` : "Primeiro dia útil após a prorrogação",
          status: terminal.blocked ? "extended" : "due",
          number: null,
          source: terminal.source
        });
      }
    }
    const elapsed = Math.round((cursor.getTime() - start.getTime()) / 86400000);
    return {
      dueDate: cursor,
      counted,
      elapsed,
      excludedWeekends,
      excludedHolidays,
      excludedSuspensions,
      excluded: excludedWeekends + excludedHolidays + excludedSuspensions,
      entries
    };
  }

  function renderTimeline(entries) {
    const timeline = document.querySelector("#timeline");
    timeline.replaceChildren();
    const fragment = document.createDocumentFragment();
    for (const entry of entries) {
      const row = document.createElement("div");
      row.className = "timeline-row";
      const date = document.createElement("span");
      date.innerHTML = `<strong>${formatShort(entry.date)}</strong><small>${capitalize(weekday(entry.date))}</small>`;
      const reason = document.createElement("span");
      reason.textContent = entry.reason;
      if (entry.source) {
        const source = document.createElement("small");
        source.textContent = entry.source;
        reason.append(source);
      }
      const status = document.createElement("span");
      status.className = `timeline-status ${entry.status}`;
      status.textContent = {
        counted: entry.number ? `${entry.number}º dia` : "Contado",
        initial: "Excluído",
        excluded: "Não contado",
        extended: entry.number ? `${entry.number}º + prorrogação` : "Prorrogado",
        due: "Vencimento"
      }[entry.status] || "Não contado";
      row.append(date, reason, status);
      fragment.append(row);
    }
    timeline.append(fragment);
  }

  function renderBreakdown(calculation, start, mode, options) {
    const summary = document.querySelector("#breakdown-summary");
    summary.replaceChildren();
    const firstCounted = calculation.entries.find((entry) => entry.status === "counted");
    const rows = [
      ["Termo inicial excluído", formatShort(start)],
      ["Início efetivo da contagem", firstCounted ? formatShort(firstCounted.date) : "—"],
      ["Regra aplicada", mode === "business" ? "Somente dias úteis" : "Dias corridos, com suspensão legal e prorrogação do vencimento"],
      ["Fins de semana não contados", String(calculation.excludedWeekends)],
      ["Feriados / dias sem expediente não contados", String(calculation.excludedHolidays)],
      ["Dias de suspensão não contados", String(calculation.excludedSuspensions)],
      ["Data final estimada", `${capitalize(weekday(calculation.dueDate))}, ${formatLong(calculation.dueDate)}`]
    ];

    const heading = document.createElement("h4");
    heading.textContent = "Resumo da contagem";
    const grid = document.createElement("dl");
    for (const [label, value] of rows) {
      const term = document.createElement("dt");
      term.textContent = label;
      const description = document.createElement("dd");
      description.textContent = value;
      grid.append(term, description);
    }
    const ruleNote = document.createElement("p");
    ruleNote.className = "breakdown-rule";
    ruleNote.textContent = options.matter === "criminal"
      ? "Perfil criminal: contagem contínua conforme o CPP. Fins de semana e feriados intermediários são computados; a suspensão de 20/12 a 20/01 é aplicada, ressalvadas as exceções do art. 798-A."
      : `Perfil ${options.matter === "labor" ? "trabalhista" : "cível"}: contam-se apenas dias úteis, excluindo automaticamente dias sem expediente e suspensões legais aplicáveis.`;
    summary.append(heading, grid, ruleNote);
  }

  function clearValidation() {
    errorBox.hidden = true;
    form.querySelectorAll(".field-invalid").forEach((field) => field.classList.remove("field-invalid"));
  }

  function invalidate(element, message) {
    element.closest(".field")?.classList.add("field-invalid");
    errorBox.textContent = message;
    errorBox.hidden = false;
    element.focus();
    return false;
  }

  function validateForm() {
    clearValidation();
    if (!dataReady) return invalidate(stateSelect, "A base de localidades ainda está carregando. Aguarde um instante.");
    if (!stateSelect.value) return invalidate(stateSelect, "Selecione o Estado.");
    if (!municipalityInput.value) return invalidate(municipalitySearch, "Selecione um Município da lista.");
    if (!matterSelect.value) return invalidate(matterSelect, "Selecione a Matéria.");
    if (!processSelect.value) return invalidate(processSelect, "Informe se o processo é Eletrônico ou Físico.");
    if (!courtSelect.value) return invalidate(courtSelect, "Selecione o Tribunal.");
    if (!startInput.value) return invalidate(startInput, "Informe a Data da Publicação.");
    const days = Number(daysInput.value);
    if (!Number.isInteger(days) || days < 1 || days > 365) {
      return invalidate(daysInput, "Informe um prazo entre 1 e 365 dias.");
    }
    return true;
  }

  function calculationContext() {
    return {
      state: selectedText(stateSelect),
      stateCode: stateSelect.value,
      municipality: selectedMunicipalityName,
      matter: selectedText(matterSelect),
      process: selectedText(processSelect),
      court: selectedText(courtSelect)
    };
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    const days = Number(daysInput.value);
    const start = fromKey(startInput.value);
    const mode = new FormData(form).get("countMode");
    const options = {
      useRecess: true,
      useCommonDates: true,
      stateCode: stateSelect.value,
      municipality: selectedMunicipalityName,
      matter: matterSelect.value,
      federalCourt: /^(STF|STJ|TST|STM|TSE|TRF)/.test(selectedText(courtSelect))
    };
    const context = calculationContext();
    const calculation = calculate(start, days, mode, options);

    document.querySelector("#result-weekday").textContent = capitalize(weekday(calculation.dueDate));
    document.querySelector("#result-date").textContent = formatLong(calculation.dueDate);
    document.querySelector("#result-summary").textContent =
      `${days} ${mode === "business" ? "dias úteis" : "dias corridos"} a partir da publicação de ${formatShort(start)} · dia inicial excluído`;
    document.querySelector("#stat-counted").textContent = calculation.counted;
    document.querySelector("#stat-elapsed").textContent = calculation.elapsed;
    document.querySelector("#stat-excluded").textContent = calculation.excluded;

    const contextBox = document.querySelector("#result-context");
    contextBox.replaceChildren();
    [context.matter, context.process, `${context.municipality}/${context.stateCode}`, context.court].forEach((value) => {
      const chip = document.createElement("span");
      chip.textContent = value;
      contextBox.append(chip);
    });
    renderBreakdown(calculation, start, mode, options);
    renderTimeline(calculation.entries);

    lastResultText = `Prazo Fácil: vencimento estimado em ${formatLong(calculation.dueDate)}. ${days} ${mode === "business" ? "dias úteis" : "dias corridos"}; publicação em ${formatShort(start)}; ${context.matter}; ${context.process}; ${context.municipality}/${context.stateCode}; ${context.court}. Confira no calendário oficial do tribunal.`;
    lastCalculation = { ...calculation, context, days, mode, start };
    result.hidden = false;
    result.scrollIntoView({ behavior: "smooth", block: "center" });
  });

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

  document.querySelector("#download-calendar").addEventListener("click", () => {
    if (!lastCalculation) return;
    const { dueDate, context, days } = lastCalculation;
    const date = `${dueDate.getUTCFullYear()}${pad(dueDate.getUTCMonth() + 1)}${pad(dueDate.getUTCDate())}`;
    const nextDate = addDay(dueDate);
    const end = `${nextDate.getUTCFullYear()}${pad(nextDate.getUTCMonth() + 1)}${pad(nextDate.getUTCDate())}`;
    const escapeIcs = (value) => value.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;").replace(/\n/g, "\\n");
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Prazo Facil//Calculadora de Prazo//PT-BR",
      "BEGIN:VEVENT",
      `UID:${Date.now()}@calculadoradeprazo.pro`,
      `DTSTART;VALUE=DATE:${date}`,
      `DTEND;VALUE=DATE:${end}`,
      `SUMMARY:${escapeIcs(`Vencimento de prazo — ${context.matter}`)}`,
      `DESCRIPTION:${escapeIcs(`${days} dias. ${context.court}; ${context.municipality}/${context.stateCode}. Confira no calendário oficial.`)}`,
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
    link.download = `prazo-${toKey(dueDate)}.ics`;
    link.click();
    URL.revokeObjectURL(link.href);
  });

  document.querySelector("#new-calculation").addEventListener("click", () => {
    result.hidden = true;
    stateSelect.focus();
  });

  document.querySelectorAll(".deadline-card").forEach((card) => {
    card.addEventListener("click", () => {
      daysInput.value = card.dataset.days;
      matterSelect.value = card.dataset.type;
      document.querySelector("#business").checked = true;
      document.querySelector("#calculadora").scrollIntoView({ behavior: "smooth" });
      startInput.focus({ preventScroll: true });
    });
  });

  for (const element of [stateSelect, matterSelect, processSelect, courtSelect, startInput, daysInput]) {
    element.addEventListener("change", () => element.closest(".field")?.classList.remove("field-invalid"));
  }

  municipalitySearch.placeholder = "Carregando municípios...";
  initializeData();
})();
