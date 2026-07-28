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
      const run = async (start, days) => {
        document.querySelector('#start-date').value = start;
        document.querySelector('#days').value = days;
        document.querySelector('#business').checked = true;
        document.querySelector('#court-recess').checked = true;
        document.querySelector('#deadline-form').requestSubmit();
        await new Promise(resolve => setTimeout(resolve, 50));
        return document.querySelector('#result-date').textContent;
      };
      return {
        standard: await run('2026-07-28', 15),
        nationalHoliday: await run('2026-09-04', 1),
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
    courtRecess: "21 de janeiro de 2027"
  };

  for (const [caseName, expectedDate] of Object.entries(expected)) {
    if (actual[caseName] !== expectedDate) {
      throw new Error(`${caseName}: expected "${expectedDate}", received "${actual[caseName]}"`);
    }
  }
  console.log("Browser interaction and deadline calculations passed.");
  socket.close();
} finally {
  browser.kill();
}
