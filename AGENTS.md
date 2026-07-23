<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# integral-planner-i10

Planejador de educação integral do Instituto i10: wizard que projeta receita, custos e fluxo de caixa da adoção do modelo integral em municípios de SP (desbloqueio do multiplicador FUNDEB 1,50x) e exporta a análise em PDF. `CLAUDE.md` referencia este arquivo via `@AGENTS.md` — mantenha um só documento.

## Stack
- **Framework:** Next.js **16.2.6** (App Router) + React **19.2.4** / react-dom 19.2.4. **Leia `node_modules/next/dist/docs/` antes de codar** (bloco acima).
- **Linguagem:** TypeScript ^5, ESM.
- **UI:** Tailwind CSS **v4** (`@tailwindcss/postcss`), Radix UI (select, slider, slot, tabs, tooltip), lucide-react, recharts, `class-variance-authority` + `clsx` + `tailwind-merge`.
- **PDF:** jspdf + jspdf-autotable. **Validação:** zod ^4.
- **Dados:** JSON estático (`data/municipios-sp.json`) servido por rota de API; sem banco.
- **Deploy:** Vercel (auto-deploy da `main`); não há `vercel.json` (defaults do Next).
- **Package manager:** npm (`package-lock.json`).

## Comandos
Scripts reais de `package.json`:
- **Dev:** `npm run dev` (`next dev`, http://localhost:3000)
- **Build:** `npm run build` (`next build`)
- **Start (prod):** `npm run start` (`next start`)
- **Lint:** `npm run lint` (`eslint`)
- **Typecheck:** `npx tsc --noEmit` (não há script dedicado)
- Não há testes configurados. Ver "Testes".

## Estrutura
- `app/layout.tsx`, `app/page.tsx`, `app/globals.css` — App Router; `/planner` redireciona para `/` (`next.config.ts`).
- `app/api/municipalities/route.ts` — `GET` que filtra `data/municipios-sp.json` por `?q=` (máx. 20 resultados).
- `components/planner/` — wizard: `planner-provider.tsx` (estado), `planner-shell.tsx`, `stepper.tsx` e passos (`step-municipality`, `step-plan-config`, `step-scenarios`, `step-financing`, `step-results`).
- `components/charts/` — `revenue-chart.tsx`, `cash-flow-chart.tsx` (recharts).
- `lib/engine/` — motor de cálculo: `revenue.ts`, `costs.ts`, `cash-flow.ts`, `financial-metrics.ts`, `sensitivity.ts`, `index.ts`.
- `lib/` — `types.ts` (+ `parseMunicipality`), `constants.ts`, `utils.ts`, `pdf.ts`.
- `data/municipios-sp.json` — base de municípios de SP.

## Convenções de código
- **TS strict** (`tsconfig.json`); alias `@/*` → raiz.
- **ESLint** via `eslint.config.mjs` (flat config): `eslint-config-next/core-web-vitals` + `.../typescript`. Rode `npm run lint` antes do PR.
- Tailwind v4 (config em CSS/PostCSS, não `tailwind.config.js`); componha classes com `cn()`/`tailwind-merge`, use CVA para variantes.
- Toda a lógica financeira vive em `lib/engine/` (puro, testável) — componentes só orquestram e renderizam.
- Server Components por padrão; marque `"use client"` só onde precisar de estado/efeitos (wizard/charts).

## Variáveis de ambiente
Nenhuma env é lida no código-fonte hoje (dados são estáticos). Se adicionar integrações, configure em `.env.local` (dev) e **Vercel → Environment Variables** (prod), e prefixe com `NEXT_PUBLIC_` apenas o que puder ir ao cliente. Nunca commitar `.env*`.

## CI/CD & Deploy
- Auto-deploy pela Vercel a cada push na `main`; PRs geram Preview Deployments. Não há workflows em `.github/`.
- **CI mínimo recomendado (em PR):** workflow com `npm ci`, `npm run lint`, `npx tsc --noEmit` e `npm run build`.

## Boas práticas de PR
- Branches: `feat/…`, `fix/…`, `chore/…`.
- Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`).
- PRs pequenos e focados. Checklist:
  - [ ] `npm run build` e `npm run lint` passam; `tsc --noEmit` limpo.
  - [ ] Nenhum segredo commitado.
  - [ ] Screenshots do wizard quando mexer na UI.
  - [ ] Mudança no motor (`lib/engine/`) revisada quanto a impacto nos números.
- ≥1 review, squash merge, `main` sempre deployável (Preview verde).

## Testes
Não há testes automatizados. O `lib/engine/` é código puro e ideal para testes unitários (Vitest) — recomendação mínima: cobrir `revenue`, `costs`, `cash-flow` e `sensitivity` com casos-referência de município antes de evoluir a fórmula FUNDEB.

## Segurança & dados
- Nunca commitar `.env*`/segredos.
- `data/municipios-sp.json` é dado público; se surgirem dados de contato/pessoais, tratar sob LGPD.
- Revise dependências ao atualizar (Next 16 / React 19 têm breaking changes frequentes).

## Gotchas
- **Next 16 é diferente do seu treinamento** — consulte `node_modules/next/dist/docs/` antes de tocar em roteamento, cache, `route.ts` ou config.
- `/planner` é redirect permanente para `/` (`next.config.ts`) — não crie página em `/planner`.
- Tailwind **v4**: sem `tailwind.config.js`; configuração vive no PostCSS/CSS.
- jspdf roda no cliente; geração de PDF depende de componente client-side.
- `CLAUDE.md` só faz `@AGENTS.md` — edite aqui, não duplique lá.
