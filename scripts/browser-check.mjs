import { spawn } from "node:child_process";
import { resolve } from "node:path";

const edge = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const port = 9336;
const profile = resolve(".edge-browser-check");
const browser = spawn(edge, [
  "--headless=new",
  "--disable-gpu",
  "--no-first-run",
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${profile}`,
  "http://127.0.0.1:4173/"
], { stdio: "ignore" });

const wait = (milliseconds) => new Promise((resolvePromise) => setTimeout(resolvePromise, milliseconds));

async function getPage() {
  for (let attempt = 0; attempt < 30; attempt++) {
    try {
      const pages = await fetch(`http://127.0.0.1:${port}/json/list`).then((response) => response.json());
      const page = pages.find((item) => item.type === "page" && item.url.startsWith("http://127.0.0.1:4173/"));
      if (page) return page;
    } catch {}
    await wait(200);
  }
  throw new Error("Could not connect to the headless browser");
}

try {
  const page = await getPage();
  await wait(1000);
  const socket = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolvePromise, reject) => {
    socket.addEventListener("open", resolvePromise, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });

  let id = 0;
  const pending = new Map();
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (!message.id || !pending.has(message.id)) return;
    const { resolve: resolveCall, reject } = pending.get(message.id);
    pending.delete(message.id);
    message.error ? reject(new Error(message.error.message)) : resolveCall(message.result);
  });

  const call = (method, params = {}) => new Promise((resolveCall, reject) => {
    const callId = ++id;
    pending.set(callId, { resolve: resolveCall, reject });
    socket.send(JSON.stringify({ id: callId, method, params }));
  });

  const expression = `
    (async () => {
      for (let i = 0; i < 40 && document.querySelector('#deadline-form')?.dataset.ready !== 'true'; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      const state = document.querySelector('#state');
      state.value = 'SP';
      state.dispatchEvent(new Event('change', { bubbles: true }));
      const municipality = document.querySelector('#municipality-search');
      municipality.value = 'São Paulo';
      municipality.dispatchEvent(new Event('input', { bubbles: true }));
      await new Promise(resolve => setTimeout(resolve, 50));
      municipality.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      document.querySelector('#case-type').value = 'civil';
      document.querySelector('#case-type').dispatchEvent(new Event('change', { bubbles: true }));
      document.querySelector('#process-type').value = 'electronic';
      const court = document.querySelector('#court');
      court.selectedIndex = 1;
      court.dispatchEvent(new Event('change', { bubbles: true }));
      const run = async (start, days, mode = 'business', courtIndex = 1, matter = 'civil') => {
        document.querySelector('#case-type').value = matter;
        document.querySelector('#case-type').dispatchEvent(new Event('change', { bubbles: true }));
        court.selectedIndex = courtIndex;
        court.dispatchEvent(new Event('change', { bubbles: true }));
        document.querySelector('#start-date').value = start;
        document.querySelector('#days').value = days;
        document.querySelector(mode === 'business' ? '#business' : '#calendar-days').checked = true;
        document.querySelector('#deadline-form').requestSubmit();
        await new Promise(resolve => setTimeout(resolve, 50));
        return {
          date: document.querySelector('#result-date').textContent,
          breakdown: document.querySelector('#breakdown-summary').textContent,
          timeline: document.querySelector('#timeline').textContent
        };
      };
      return {
        streamlinedForm: !document.querySelector('#court-unit') && !document.querySelector('.advanced-options'),
        standard: await run('2026-07-28', 15),
        nationalHoliday: await run('2026-09-04', 1),
        commonCourtClosure: await run('2026-02-13', 1),
        stateHoliday: await run('2026-07-08', 1),
        municipalHoliday: await run('2027-01-22', 1),
        federalCourtHoliday: await run('2026-08-10', 1, 'business', 2),
        criminalContinuous: await run('2026-09-04', 3, 'calendar', 1, 'criminal'),
        courtRecess: await run('2026-12-18', 1)
      };
    })()
  `;
  const response = await call("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true
  });
  if (response.exceptionDetails) {
    throw new Error(response.exceptionDetails.exception?.description || response.exceptionDetails.text);
  }
  const actual = response.result.value;
  const expected = {
    standard: "18 de agosto de 2026",
    nationalHoliday: "08 de setembro de 2026",
    commonCourtClosure: "18 de fevereiro de 2026",
    stateHoliday: "10 de julho de 2026",
    municipalHoliday: "26 de janeiro de 2027",
    federalCourtHoliday: "12 de agosto de 2026",
    criminalContinuous: "08 de setembro de 2026",
    courtRecess: "21 de janeiro de 2027"
  };

  if (!actual.streamlinedForm) {
    throw new Error("Removed calculator inputs are still present");
  }

  for (const [caseName, expectedDate] of Object.entries(expected)) {
    if (actual[caseName].date !== expectedDate) {
      throw new Error(`${caseName}: expected "${expectedDate}", received "${actual[caseName].date}"`);
    }
  }
  if (!actual.stateHoliday.timeline.includes("Revolução Constitucionalista") ||
      !actual.municipalHoliday.timeline.includes("Aniversário de São Paulo") ||
      !actual.federalCourtHoliday.timeline.includes("Criação dos cursos jurídicos") ||
      !actual.commonCourtClosure.timeline.includes("Carnaval")) {
    throw new Error("Automatic holiday sources are missing from the day-by-day breakdown");
  }
  if (!actual.criminalContinuous.breakdown.includes("contagem contínua") ||
      !actual.criminalContinuous.timeline.includes("computado por ser prazo contínuo")) {
    throw new Error("Criminal continuous-day profile or breakdown is incorrect");
  }

  await call("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true
  });
  await call("Page.navigate", { url: "http://127.0.0.1:4173/" });
  await wait(700);
  const mobileResponse = await call("Runtime.evaluate", {
    expression: `({
      viewport: window.innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      cardWidth: Math.round(document.querySelector('.calculator-card').getBoundingClientRect().width),
      cardRight: Math.round(document.querySelector('.calculator-card').getBoundingClientRect().right)
    })`,
    returnByValue: true
  });
  const mobile = mobileResponse.result.value;
  if (mobile.viewport !== 390 || mobile.documentWidth > 390 || mobile.cardRight > 390 || mobile.cardWidth < 340) {
    throw new Error(`Mobile layout overflow: ${JSON.stringify(mobile)}`);
  }

  await call("Page.navigate", { url: "http://127.0.0.1:4173/contato/" });
  await wait(700);
  const contactResponse = await call("Runtime.evaluate", {
    expression: `
      (async () => {
        for (let i = 0; i < 40 && document.querySelector('#contact-form')?.dataset.ready !== 'true'; i++) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        const nativeFetch = window.fetch.bind(window);
        let request;
        window.fetch = async (url, options) => {
          request = { url, options };
          return { ok: true, json: async () => ({ success: true }) };
        };
        document.querySelector('#contact-name').value = 'Maria Silva';
        document.querySelector('#contact-email').value = 'maria@example.com';
        document.querySelector('#contact-message').value = 'Mensagem de teste do formulário.';
        document.querySelector('#contact-form').requestSubmit();
        await new Promise(resolve => setTimeout(resolve, 100));
        const success = {
          url: request.url,
          payload: JSON.parse(request.options.body),
          status: document.querySelector('#contact-status').textContent,
          nameAfterSubmit: document.querySelector('#contact-name').value
        };

        window.fetch = async () => ({ ok: false, json: async () => ({}) });
        document.querySelector('#contact-name').value = 'João Souza';
        document.querySelector('#contact-email').value = 'joao@example.com';
        document.querySelector('#contact-message').value = 'Esta mensagem deve ser preservada.';
        document.querySelector('#contact-form').requestSubmit();
        await new Promise(resolve => setTimeout(resolve, 100));
        const result = {
          success,
          failureStatus: document.querySelector('#contact-status').textContent,
          failureMessage: document.querySelector('#contact-message').value
        };
        window.fetch = nativeFetch;
        return result;
      })()
    `,
    awaitPromise: true,
    returnByValue: true
  });
  if (contactResponse.exceptionDetails) {
    throw new Error(contactResponse.exceptionDetails.exception?.description || contactResponse.exceptionDetails.text);
  }
  const contact = contactResponse.result.value;
  if (contact.success.url !== "https://formsubmit.co/ajax/contato@calculadoradeprazo.pro") {
    throw new Error("Contact form used the wrong endpoint");
  }
  if (contact.success.payload._subject !== "Novo contato — Calculadora de Prazo") {
    throw new Error("Contact form used the wrong subject");
  }
  if (!contact.success.status.includes("sucesso") || contact.success.nameAfterSubmit) {
    throw new Error("Contact success behavior failed");
  }
  if (!contact.failureStatus.includes("Não foi possível") || contact.failureMessage !== "Esta mensagem deve ser preservada.") {
    throw new Error("Contact failure behavior failed");
  }

  const notFoundResponse = await call("Runtime.evaluate", {
    expression: `
      fetch('/pagina-que-nao-existe/')
        .then(async response => ({
          status: response.status,
          robots: response.headers.get('x-robots-tag'),
          html: await response.text()
        }))
    `,
    awaitPromise: true,
    returnByValue: true
  });
  const notFound = notFoundResponse.result.value;
  if (notFound.status !== 404 ||
      !notFound.robots?.includes("noindex") ||
      !notFound.html.includes('<meta name="robots" content="noindex, follow">') ||
      notFound.html.includes('rel="canonical"')) {
    throw new Error(`Custom 404 indexability behavior failed: ${JSON.stringify({
      status: notFound.status,
      robots: notFound.robots,
      hasMetaNoindex: notFound.html.includes('<meta name="robots" content="noindex, follow">'),
      hasCanonical: notFound.html.includes('rel="canonical"'),
      bodyStart: notFound.html.slice(0, 80)
    })}`);
  }

  console.log("Browser calculator, AJAX contact-form, responsive layout, and 404 checks passed.");
  socket.close();
} finally {
  browser.kill();
}
