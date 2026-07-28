# Estratégia de SEO — Reverse Engineering do modelo "Prazo Fácil"
### Como um site com Ahrefs DR 2 domina 100+ keywords jurídicas de alto volume

---

## 1. Diagnóstico: por que um DR2 rankeia tão bem

Isso **não é sorte** — é um padrão clássico de SEO que funciona mesmo com autoridade de domínio baixíssima. Os pilares:

| Fator | Por que funciona mesmo com DR baixo |
|---|---|
| **Ferramenta (utility content), não artigo** | Google prioriza intenção transacional/utilitária. Quem busca "calculadora de prazo" quer *usar* algo, não ler 2.000 palavras. Poucos concorrentes constroem a ferramenta de verdade — a maioria só escreve texto. Isso reduz drasticamente a concorrência real. |
| **Match exato de marca + produto no domínio** | "prazofacil.com.br" casa 1:1 com a keyword principal "prazo facil" / "prazo fácil". Domínio EMD (exact-match domain) ainda ajuda bastante em nichos de baixa/média competição. |
| **Long-tail com intenção idêntica, baixíssima dificuldade** | Termos como "calculadora prazo dias úteis", "prazo apelação", "trt10 consulta processual" têm volume pequeno individualmente mas dificuldade quase zero — ninguém fez conteúdo dedicado. Multiplicados por centenas de variações (tribunal x comarca x matéria), isso gera um volume agregado enorme. |
| **Estrutura "programática" (programmatic SEO) implícita** | O formulário (Estado → Município → Tribunal → Vara → Matéria) sugere um banco de dados combinatório. Isso é a receita perfeita para gerar milhares de páginas/URLs long-tail (ex: "calculadora de prazo TJSP", "calculadora de prazo TJMS", "calculadora TJGO") sem escrever cada uma manualmente. |
| **Cluster temático coerente (topical authority)** | Todas as keywords giram em torno de UM conceito: contagem/cálculo de prazo processual. Isso sinaliza ao Google um site 100% especializado nesse nicho — mais fácil de rankear em cauda longa quando o tema é hiperfocado. |
| **Ferramentas satélites (audio, correção monetária, juros, datas, validadores CPF/CNPJ, QR code)** | Ampliam o "guarda-chuva" de utilidades jurídico-financeiras, capturando tráfego adjacente (ex: "correção monetária", "cálculo de juros") e aumentam tempo de sessão / páginas por visita — sinais de engajamento que ajudam SEO geral do domínio. |
| **Baixíssima necessidade de backlinks** | Ferramentas resolvem um problema real (advogados/estagiários calculando prazos manualmente é doloroso), então usuários voltam, indicam no Boca a Boca (WhatsApp, grupos de advogados), gerando backlinks e brand searches orgânicos com pouco esforço de outreach. |

**Conclusão estratégica:** o modelo replicável é "**Ferramenta + Programmatic SEO + Cluster hiperfocado**", não "blog com artigos". Isso é o oposto do SEO tradicional de conteúdo — e é exatamente por isso que funciona com DR2.

---

## 2. Clusterização das keywords fornecidas

Agrupando as ~120 keywords por intenção, dá para ver a arquitetura ideal de páginas:

### Cluster A — Marca / Head term (página inicial)
`prazo facil`, `prazofacil`, `prazo facíl`, `prazito` → **Home page**, otimizada para a marca + a keyword genérica mais forte.

### Cluster B — Ferramenta genérica (página inicial ou pillar page)
`calculadora de prazo`, `calculadora prazo`, `calculo prazo`, `contador de prazo`, `contagem de prazo`, `conta prazo`, `calcular prazo`, `contar prazo`, `qual o prazo`, `prazo certo`, `calculadora facil`, `conta facil`, `conta fácil` → página core (a própria calculadora).

### Cluster C — Prazo processual (jurídico geral)
`prazo processual`, `calculadora de prazos processuais`, `contagem de prazo processual`, `calculadora prazo processual`, `contador de prazo processual`, `calculo prazo processual`, `contagem prazo processual`, `calcular prazo processual`, `contar prazo processual`, `prazo processual calculadora` → **pillar page** "Guia completo de prazos processuais" + calculadora incorporada.

### Cluster D — Por ramo do direito (matéria)
- **Processo Civil**: `prazos no processo civil`, `contagem de prazo no processo civil`, `contagem de prazo cpc`, `prazos cpc`
- **Processo Penal**: `prazos processo penal`, `prazos no processo penal`, `contagem de prazo no processo penal`, `prazo resposta a acusação`, `prazo para apelar`, `prazo apelação`
- **Trabalhista** (implícito pela ferramenta): expandir com `prazo trabalhista`, `contagem de prazo CLT`

→ Cada ramo merece **página própria** (landing + calculadora pré-filtrada por "Matéria").

### Cluster E — Por Tribunal / Comarca (o maior potencial de escala)
`trt10 consulta processual`, `calculadora de prazos tjsp`, `calculadora prazo tjsp`, `contador de prazo tjsp`, `contagem de prazo tjsp`, `contagem prazo tjsp`, `prazo tj sp`, `prazos tj sp`, `prazo tjsp`, `calculadora de prazos tjms`, `calculadora tjgo`, `prazo facil tjsp`, `pjetjdf` → **Página programática por tribunal** (TJSP, TJMS, TJGO, TRT10, TJDF/PJE-TJDF, e por extensão os 27 TJs + 24 TRTs + 6 TRFs + STJ/STF/TST). Esse é o cluster com maior potencial multiplicador de tráfego.

### Cluster F — Prescrição / CNJ
`calculadora prescrição cnj`, `calculadora prescricao cnj`, `calculadora de prescrição cnj`, `calculadora cnj`, `cnj calculadora`, `calculadora cnj prescrição` → página específica "Calculadora de Prescrição (Tabela CNJ)".

### Cluster G — Variações técnicas de contagem
`contagem de prazos`, `contagem prazos`, `contagem do prazo`, `contagem dos prazos processuais`, `prazo sucessivo`, `extensão de prazo`, `prazos legais`, `prazo legal` → conteúdo educativo (artigos de apoio, FAQ, glossário) linkando para a calculadora.

### Cluster H — Cauda genérica não-jurídica (oportunidade de expansão)
`quanto tempo demora`, `quantos dias demora`, `calculadora prazo dias`, `calculadora prazo dias uteis`, `calculadora prazo dias úteis`, `prazo para` → sugerem tráfego de usuários leigos também buscando "calculadora de dias úteis" genérica — pode virar uma ferramenta adicional (Cluster já existe: "Operações com Datas").

---

## 3. Arquitetura de site recomendada (blueprint)

```
/                                → Home = calculadora principal (Cluster A + B)
/prazos-processuais/             → Pillar page do cluster C (guia + calculadora)
/prazos-processuais/civil/       → Cluster D (civil)
/prazos-processuais/penal/       → Cluster D (penal)
/prazos-processuais/trabalhista/ → Cluster D (trabalhista)
/tribunais/tjsp/                 → Cluster E (1 página por tribunal)
/tribunais/tjms/
/tribunais/tjgo/
/tribunais/trt10/
/tribunais/                      → hub/índice de todos os tribunais (interlinking)
/prescricao-cnj/                 → Cluster F
/glossario/contagem-de-prazo/    → Cluster G (conteúdo de suporte, FAQ, PAA)
/informativos/[tribunal]/        → já existe: feriados/instabilidades por tribunal (ótimo p/ freshness)
/datas/ /juros/ /correcao/ /validadores/ /audio/ /qrcode/ → ferramentas satélites (já existentes)
```

**Regra de ouro do programmatic SEO:** cada página de tribunal (`/tribunais/tjsp/`) deve ter:
- Calculadora pré-filtrada (Estado + Tribunal já selecionados)
- Texto único (200-400 palavras) sobre peculiaridades daquele tribunal (feriados forenses locais, sistema PJe vs físico, prazos em dobro para Fazenda Pública, etc.)
- FAQ específico ("Como contar prazo no TJSP?", "TJSP conta prazo em dias úteis ou corridos?")
- Tabela de feriados forenses do ano vigente (conteúdo que precisa atualização anual — bom para freshness/CTR)
- Breadcrumb + schema
- Interlinking para tribunais "vizinhos" e para o pillar page da matéria

Isso transforma 1 keyword-semente em **50+ páginas únicas e defensáveis** (uma por tribunal/UF), cada uma capturando sua própria cauda longa geo-específica — exatamente o padrão observado nas keywords fornecidas (tjsp, tjms, tjgo, trt10, pjetjdf...).

---

## 4. Template de otimização on-page (por página)

### Title tag
`{Keyword-alvo} — {Benefício} | Prazo Fácil`
Ex: `Calculadora de Prazos TJSP — Contagem Automática com Feriados | Prazo Fácil`

### Meta description (usar o padrão já existente no site, é bom)
Benefício + gratuidade + especificidade + CTA implícito.
Ex: *"Calcule prazos processuais do TJSP em segundos. Considera feriados forenses, recessos e prazos em dobro. Grátis e atualizado para 2026."*

### H1
Deve conter a keyword principal exata da página, nunca genérico repetido em todas as páginas.

### Estrutura de conteúdo recomendada por página de cauda longa:
1. H1 com a keyword
2. Calculadora (above the fold — é o que gera o "dwell time" e satisfação de intenção)
3. H2 "Como funciona a contagem de prazo em [X]"
4. H2 "Prazos mais comuns em [X]" (tabela: tipo de prazo x dias x fundamento legal)
5. H2 "Feriados forenses de [X] em 2026" (tabela) — **conteúdo evergreen que precisa refresh anual**
6. FAQ (schema FAQPage) com 4-6 perguntas reais extraídas do "People Also Ask"
7. Link para pillar page da matéria + para outros tribunais do mesmo estado

### Internal linking
- Toda página de tribunal → linka para o pillar da matéria (civil/penal/trabalhista) e vice-versa
- Home → linka para os tribunais de maior volume (TJSP, TJRJ, TJMG, TRT2, TRT10...)
- Blog/glossário → linka para as calculadoras específicas (não apenas para a home)

---

## 5. SEO Técnico — checklist de melhoria

| Item | Status provável hoje | Ação recomendada |
|---|---|---|
| Core Web Vitals | Formulário JS pesado pode penalizar LCP/INP | Lazy-load de scripts não críticos; calculadora deve responder instantaneamente (client-side onde possível) |
| Schema markup | Provavelmente ausente/mínimo | Implementar `SoftwareApplication` (para a calculadora), `FAQPage`, `BreadcrumbList`, `Organization` |
| Sitemap | — | Sitemap XML segmentado (tribunais, ferramentas, informativos) + envio ao GSC |
| Indexação em massa | Formulário dinâmico ≠ páginas indexáveis | Criar URLs estáticas/pré-renderizadas para cada combinação Estado+Tribunal (SSR ou geração estática), não deixar tudo atrás de JS puro |
| Mobile-first | `meta-viewport` OK | Testar formulário completo em mobile (selects grandes, sem zoom necessário) |
| HTTPS/Canonical | Já presente (`canonical`, `meta-robots: index, follow`) | Manter consistência canônica entre `/` e variações com parâmetros |
| Velocidade de carregamento | Popup de cookies/termos pode atrasar renderização | Diferir modais para depois do LCP |
| Dados estruturados de FAQ | Ausente | Cada página de tribunal ganha 4-6 perguntas em `FAQPage` schema — ótimo para featured snippets e PAA |
| `hreflang` | Não aplicável (pt-BR único) | Garantir `lang="pt-BR"` explícito no `<html>` |
| Robots.txt | Verificar | Garantir que páginas de utilidade (calculadoras) não estão bloqueadas, e that páginas de admin/API estão |

---

## 6. Estratégia de conteúdo (o "hub" de Informativos já é uma mina de ouro)

O site já tem `/informativos?info=tjs|trfs|trts|superiores|instabilidades`. Isso é **conteúdo de altíssima frequência de atualização** (feriados, recessos, instabilidades de sistemas de tribunais) — excelente para:

1. **Freshness signal constante** → Google gosta de sites atualizados com frequência em nichos "YMYL-adjacent" (jurídico).
2. **Capturar buscas sazonais**: "feriado forense [tribunal] 2026", "recesso forense TJSP", "PJe fora do ar [tribunal]".
3. **Transformar cada informativo em página própria indexável** (não só filtro de URL) — `/informativos/tjsp-feriados-2026/` em vez de apenas querystring, para melhor indexação individual.

**Recomendação**: criar um calendário editorial:
- Atualização anual (dezembro/janeiro) de todos os feriados forenses por tribunal
- Alertas de instabilidade do PJe/eproc em tempo real (gera backlinks espontâneos de grupos de advogados no WhatsApp/Twitter/X)
- Posts curtos sobre mudanças no CPC/CNJ relevantes para contagem de prazo

---

## 7. Link building (com DR baixo, foco em nicho, não volume)

Como o site já performa bem organicamente, backlinks devem ser usados para **acelerar**, não para "consertar":

1. **Diretórios e comunidades jurídicas**: OAB seccionais, sites de faculdades de Direito, blogs de escritórios de advocacia — pedir menção como "ferramenta recomendada".
2. **Guest posts em blogs jurídicos** (Jusbrasil, Migalhas, Conjur — via colunistas, não pago) citando a ferramenta como referência de cálculo de prazo.
3. **Parcerias com criadores de conteúdo jurídico** no YouTube/Instagram/TikTok ("advogados de plantão") — pedir para linkarem na descrição.
4. **Grupos e fóruns**: grupos de WhatsApp/Telegram/Reddit de estudantes de Direito e concurseiros de carreiras jurídicas.
5. **Widget embutível**: oferecer um widget/iframe da calculadora para sites de escritórios de advocacia incluírem no próprio site (gera backlinks dofollow naturais + brand awareness).
6. **Wikipedia/Wikcionário-adjacentes**: não linkar diretamente (proibido), mas usar como fonte de dados para conteúdo educativo que depois é citado por terceiros.

---

## 8. Roadmap por fases

### Fase 1 (0–30 dias) — Fundação técnica
- Auditoria técnica completa (Core Web Vitals, indexação, schema)
- Implementar `SoftwareApplication` + `FAQPage` schema em todas as páginas
- Garantir que cada combinação Estado×Tribunal tenha URL própria indexável

### Fase 2 (30–90 dias) — Expansão programática
- Criar as páginas de tribunal (começar pelos de maior volume: TJSP, TJRJ, TJMG, TRT2, TRT10, TJDF/PJe-TJDF)
- Criar pillar pages por matéria (civil, penal, trabalhista)
- Lançar página de Prescrição CNJ dedicada

### Fase 3 (90–180 dias) — Autoridade e cauda longa
- Glossário jurídico (contagem de prazo, prazo sucessivo, prazo em dobro, etc.)
- Programa de link building em nicho (parcerias, widget embutível)
- Expandir para os 27 TJs + principais TRTs/TRFs

### Fase 4 (contínuo)
- Atualização anual de feriados forenses (dezembro/janeiro)
- Monitoramento de SERP para novas variações de cauda longa (Search Console → Query report)
- Testes de CTR em titles/descriptions das páginas de maior impressão e menor CTR

---

## 9. KPIs para acompanhar

- Nº de páginas indexadas (Google Search Console → Coverage)
- Posição média + impressões por cluster (marca / prazo processual / por tribunal / prescrição)
- CTR por página (otimizar titles onde impressão alta e CTR baixo)
- Tráfego direto/branded search (sinal de recomendação boca-a-boca)
- Backlinks referring domains (meta: crescimento constante mesmo que lento, priorizando relevância de nicho sobre volume)
- Core Web Vitals (LCP, INP, CLS) por template de página

---

## 10. Resumo executivo (TL;DR)

O "segredo" do Prazo Fácil não é autoridade de domínio — é **arquitetura de nicho hiperfocada em ferramenta útil + escala programática por tribunal/comarca + cluster temático coeso**. Para replicar ou superar:

1. Construa a ferramenta de verdade (a utilidade É o conteúdo).
2. Explore a combinatória Estado × Tribunal × Matéria como gerador de páginas long-tail únicas.
3. Mantenha um hub de conteúdo "vivo" (feriados/instabilidades) para freshness constante.
4. Adicione schema (FAQ + SoftwareApplication) para ganhar rich snippets sem precisar de DR alto.
5. Link building de nicho jurídico, não volume genérico.
