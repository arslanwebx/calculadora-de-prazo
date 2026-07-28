import { mkdir, writeFile } from "node:fs/promises";

const states = [
  { id: 1, code: "AC", name: "Acre" },
  { id: 2, code: "AL", name: "Alagoas" },
  { id: 3, code: "AP", name: "Amapá" },
  { id: 4, code: "AM", name: "Amazonas" },
  { id: 5, code: "BA", name: "Bahia" },
  { id: 6, code: "CE", name: "Ceará" },
  { id: 7, code: "DF", name: "Distrito Federal" },
  { id: 8, code: "ES", name: "Espírito Santo" },
  { id: 9, code: "GO", name: "Goiás" },
  { id: 10, code: "MA", name: "Maranhão" },
  { id: 11, code: "MT", name: "Mato Grosso" },
  { id: 12, code: "MS", name: "Mato Grosso do Sul" },
  { id: 13, code: "MG", name: "Minas Gerais" },
  { id: 14, code: "PA", name: "Pará" },
  { id: 15, code: "PB", name: "Paraíba" },
  { id: 16, code: "PR", name: "Paraná" },
  { id: 17, code: "PE", name: "Pernambuco" },
  { id: 18, code: "PI", name: "Piauí" },
  { id: 19, code: "RJ", name: "Rio de Janeiro" },
  { id: 20, code: "RN", name: "Rio Grande do Norte" },
  { id: 21, code: "RS", name: "Rio Grande do Sul" },
  { id: 22, code: "RO", name: "Rondônia" },
  { id: 23, code: "RR", name: "Roraima" },
  { id: 24, code: "SC", name: "Santa Catarina" },
  { id: 25, code: "SP", name: "São Paulo" },
  { id: 26, code: "SE", name: "Sergipe" },
  { id: 27, code: "TO", name: "Tocantins" }
];

const dataDirectory = new URL("../public/assets/data/", import.meta.url);
await mkdir(dataDirectory, { recursive: true });

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);
  return response.json();
}

const municipalityEntries = await Promise.all(states.map(async (state) => {
  const url = `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${state.code}/municipios?orderBy=nome`;
  const municipalities = await fetchJson(url);
  return [state.code, municipalities.map(({ id, nome }) => ({ id, name: nome }))];
}));

const tribunalEntries = await Promise.all(states.map(async (state) => {
  const response = await fetch("https://www.prazofacil.com.br/ajax/public/listarTribunaisPorEstado.php", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded; charset=UTF-8" },
    body: new URLSearchParams({ idEstado: String(state.id) })
  });
  if (!response.ok) throw new Error(`Could not load tribunals for ${state.code}`);
  const body = await response.text();
  const jsonStart = body.indexOf("[");
  if (jsonStart < 0) throw new Error(`Invalid tribunal response for ${state.code}`);
  const tribunals = JSON.parse(body.slice(jsonStart))
    .filter((tribunal) => String(tribunal.id) !== "-1")
    .map((tribunal) => ({ id: String(tribunal.id), name: tribunal.nome }));
  return [state.code, tribunals];
}));

const municipalities = Object.fromEntries(municipalityEntries);
const tribunals = Object.fromEntries(tribunalEntries);
const municipalityCount = Object.values(municipalities).reduce((total, list) => total + list.length, 0);
const tribunalCount = Object.values(tribunals).reduce((total, list) => total + list.length, 0);

await writeFile(new URL("states.json", dataDirectory), JSON.stringify(states), "utf8");
await writeFile(new URL("municipalities.json", dataDirectory), JSON.stringify(municipalities), "utf8");
await writeFile(new URL("tribunals.json", dataDirectory), JSON.stringify(tribunals), "utf8");
await writeFile(new URL("calculator-data-manifest.json", dataDirectory), JSON.stringify({
  generatedAt: new Date().toISOString(),
  municipalitySource: "IBGE Localidades API",
  tribunalReference: "Prazo Fácil public calculator options",
  states: states.length,
  municipalities: municipalityCount,
  tribunals: tribunalCount
}, null, 2), "utf8");

console.log(`Calculator data synced: ${states.length} states, ${municipalityCount} municipalities, ${tribunalCount} tribunals.`);
