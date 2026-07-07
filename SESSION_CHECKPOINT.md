# SESSION_CHECKPOINT — Humaniadas 2026
> Gerado em: 2026-07-07 (sessão 2)

## Estado atual do app

**Funcionando:**
- Sistema de theming completo por atlética (9 times) — bg, accent, gold, textDim, textMid aplicados no login via `applyTeamTheme()`
- Aba Geral: pódio + tabela de standings com hover e zeros temáticos
- Aba Chaveamentos: bracket eliminatório com scores
- Aba Cheerleading: lista de posições com selects, layout mobile ajustado
- Aba Simulações: lista vertical com expansão inline, dots de completion, cabeçalhos de tabela com cor da atlética simulada (não do usuário logado)
- Menu mobile: backdrop + nav fora do header, `position: fixed`, z-index 9999/9998, `isolation: isolate` no `.shell`
- Login/logout com reset de tema
- Segurança: XSS bloqueado em todos os pontos de inserção de dados do DB; admin guard correto; SRI nos CDNs; `config.js` no `.gitignore`

**Parcialmente implementado:**
- Theming mobile: cores aplicadas mas não validadas visualmente em todas as atléticas no mobile

**Pendente de validação:**
- Reconectar Vercel ao GitHub para deploy em produção
- Testes mobile end-to-end em todas as abas com login de cada atlética
- Fluxo visitante (sem login) em mobile

---

## Decisões tomadas

- **Decisão:** Theming global por atlética via CSS custom properties no `:root`
  **Motivo:** Identidade visual distinta por time ao logar; sem build step
  **Status:** definitivo

- **Decisão:** Separar `TEAM_COLORS` (cor primária para bordas/tints, pode ser escura) de `themeAccent` (CSS --accent, deve ser legível em bg escuro) de `gold` (CONCLUÍDO, campeão)
  **Motivo:** HOTUR UFF e RI UFRJ têm cor primária navy (#020684 / #003374) — ilegível como texto; themeAccent resolve isso
  **Status:** definitivo

- **Decisão:** PSICO PUC usa branco/off-white como themeAccent, amarelo só no gold
  **Motivo:** Diferenciar de GEMEL (também vermelho+amarelo); PSICO PUC = vermelho+branco, detalhes amarelos
  **Status:** definitivo

- **Decisão:** RI UFRJ backgrounds em charcoal-aço (#090c10 / #141b22) em vez de navy puro
  **Motivo:** Diferenciar visualmente de HOTUR UFF (azul-índigo profundo)
  **Status:** definitivo

- **Decisão:** Layout Simulações: lista vertical full-width com expansão inline (tabela abre abaixo do card, 100% largura)
  **Motivo:** Master-detail testado e descartado — tabela de 15 colunas precisa de largura total; coluna lateral roubava espaço
  **Status:** definitivo

- **Decisão:** Cards da lista de Simulações são full-width com dots de completion de esporte
  **Motivo:** Resolver o whitespace vazio ao lado dos cards estreitos; dots dão info útil sem complicar a expansão
  **Status:** definitivo

- **Decisão:** Sem ranking de acerto nas Simulações
  **Motivo:** O sistema é de exploração de cenários, não bolão — sem comparação com resultado real
  **Status:** definitivo

- **Decisão:** `.mobile-nav` movido para fora do `<header>` com `position: fixed`
  **Motivo:** `backdrop-filter` no header criava containing block inválido para `position: absolute`; fora do header + fixed resolve em todos os browsers
  **Status:** definitivo

- **Decisão:** `isolation: isolate` no `.shell`
  **Motivo:** Sem stacking context explícito, cheer items participavam do root stacking context e apareciam acima do overlay do menu mobile (z-9999) em compositing do Chrome
  **Status:** definitivo

- **Decisão:** `isAdmin` inicializado como `false` literalmente (não `!DB_READY || false`)
  **Motivo:** Quando `DB_READY = false` (config placeholders), `!DB_READY` retornava `true`, dando admin a todos
  **Status:** definitivo

- **Decisão:** Admin verificado via `data.user.app_metadata.is_admin` após login, não só pela presença de sessão
  **Motivo:** Qualquer usuário autenticado podia invocar funções de admin antes do fix
  **Status:** definitivo

- **Decisão:** Filter pills nas Simulações usam `data-atletica` + `addEventListener` em vez de `onclick="setSimFilter('${ea}')"`
  **Motivo:** `escHtml("'")` gera `&#39;` que o browser decodifica antes de executar o JS inline — bypass de XSS. `data-*` + listener evita o problema completamente
  **Status:** definitivo

- **Decisão:** SRI (Subresource Integrity) nos dois CDNs externos (`@supabase/supabase-js@2.110.1` e `html2canvas@1.4.1`)
  **Motivo:** Garante que arquivos CDN não foram adulterados mesmo se a CDN for comprometida
  **Status:** definitivo

- **Decisão:** `js/config.js` adicionado ao `.gitignore`
  **Motivo:** Contém `SUPABASE_URL`, `SUPABASE_ANON_KEY` e `CHAMPIONSHIP_ID` — não deve ir ao repositório
  **Status:** definitivo

- **Decisão:** Cabeçalhos das colunas em `simDetailTable` usam `TEAM_PALETTES[sim.atletica].themeAccent` em vez de `var(--accent)`
  **Motivo:** `var(--accent)` resolvia para o tema do usuário logado, não da atlética simulada — cores erradas em todas as tabelas de terceiros
  **Status:** definitivo

---

## Trabalho concluído nesta sessão

### Sessão 1 (theming + layout)
- **`js/data.js`** — TEAM_PALETTES completo para 9 atléticas; RI UFRJ backgrounds alterados para charcoal-aço
- **`js/state.js`** — `applyTeamTheme()` e `resetTeamTheme()` com todas as variáveis CSS
- **`css/podium.css`** — Removidos hardcodes laranja
- **`css/sports.css`** — Hardcodes de laranja removidos
- **`css/simulacoes.css`** — Reescrito: layout com `.sim-group`, cards full-width, dots, expansão inline
- **`js/render/simulacoes.js`** — Reescrito: `filledSports()`, `simUserCard()` com dots, `toggleSimDetail()` singleton
- **`css/cheerleading.css`** — Mobile: padding/gap reduzidos, avatar top-3 forçado 40px
- **`index.html`** — `.mobile-nav` movido para fora do `<header>`; `<div class="nav-backdrop">` adicionado
- **`css/components.css`** — `.mobile-nav` fixed; `.nav-backdrop` fixed; padding mobile unificado
- **`css/layout.css`** — `.shell { isolation: isolate }`; padding mobile 14px → 16px
- **`js/main.js`** — `toggleMobileMenu()` e `mobileNavTo()` sincronizam `navBackdrop`

### Sessão 2 (segurança + paleta)
- **`js/auth/admin.js`** — `isAdmin` inicializado como `false`; verificação de `app_metadata.is_admin` antes de setar `isAdmin = true`; `window.location.replace()` após login para limpar estado
- **`js/state.js`** — Removido `viewingSimulacao` (dead code); `setWinner`/`setCheer` protegidos com `if (!isAdmin && viewingOfficial) return`; `resetAll()` protegido com `if (!isAdmin) return`
- **`js/render/utils.js`** — `escHtml()` adicionado; `teamAvatar()` usa `escHtml()` no alt e initials
- **`js/render/simulacoes.js`** — Removido `var viewingSimulacao`; `escHtml()` aplicado em username, team, atletica; filter pills convertidos de onclick para data-attributes + addEventListener; `simDetailTable` usa `headerColor` da paleta da atlética simulada (não `var(--accent)`)
- **`js/render/standings.js`** — `escHtml(r.team)` no pódio e na tabela
- **`js/render/bracket.js`** — `escHtml(team)` em `bSlot()` (replace_all); `escHtml(current)` e `escHtml(t)` em `bSelectOrResult()`
- **`js/main.js`** — `clearBracket()` protegido; `escHtml(r.team)` no export
- **`js/auth/user.js`** — `escHtml()` em initials, username e atletica no menu avatar
- **`.gitignore`** — `js/config.js` adicionado
- **`index.html`** — SRI adicionado nos dois CDNs; versão do Supabase pinada em `@2.110.1`

---

## Pendências (em ordem de prioridade)

- [ ] Reconectar Vercel ao GitHub e fazer deploy em produção
- [ ] Testes visuais mobile de todas as 9 atléticas logadas (theming, contraste, legibilidade)
- [ ] Validar overlay do menu mobile no dispositivo físico (`isolation: isolate`)
- [ ] Testar fluxo visitante (sem login) no mobile
- [ ] Validar aba Simulações no mobile (dots visíveis, expansão, filtro, cores de cabeçalhos)
- [ ] Corrigir cookie `secure` no login.java se o app for para HTTPS (marcado como revisado no Sonar mas não corrigido — quebraria HTTP local)

---

## Bugs conhecidos

- **Overlay menu mobile sobre cheer items**: corrigido com `isolation: isolate` no `.shell` — aguarda validação no dispositivo físico.
- **Cookie `secure` em login HTTP**: issue do Sonar marcada como revisada, não corrigida — intencionalmente, pois quebraria login em HTTP local. Revisar antes de produção HTTPS.

---

## Convenções do projeto que não podem ser esquecidas

- **Sem build step, sem npm** — HTML estático com CDN Supabase. Ordem dos `<script>` em `index.html` é crítica.
- **Commits manuais** — nunca usar git via ferramentas. O usuário commita depois de testar no browser.
- **Theming**: usar sempre `themeAccent` (não `accent`) para CSS `--accent`; `accent` pode ser cor escura ilegível (ex: HOTUR UFF #020684)
- **`--accent-rgb`** deve ser derivado de `themeAccent` (não de `accent`) — usado em `rgba(var(--accent-rgb), opacity)` no CSS
- **`TEAM_TEXT_COLORS`** = cor do texto na linha destacada na tabela de Simulações (legível sobre fundo colorido)
- **`simDetailTable` cabeçalhos** = usar `TEAM_PALETTES[sim.atletica].themeAccent`, não `var(--accent)`
- **`goldDim`** no TEAM_PALETTES é `string hex`, não `rgba()` — `applyTeamTheme` usa direto como `--gold-dim`
- **`BM_MATCH_H = 140`** em `bracket.js` — não alterar
- **Admin** identificado por `app_metadata.is_admin = true` no JWT; `isAdmin` JS é só cache client-side — segurança real é RLS
- **RLS ativo** em todas as tabelas Supabase
- **`isolation: isolate` no `.shell`** — não remover
- **`.mobile-nav` fora do `<header>`** — não mover de volta; `backdrop-filter` do header quebra `position: fixed`
- **`escHtml()` obrigatório** em todo dado vindo do banco antes de inserir via innerHTML
- **Filter pills** devem usar `data-atletica` + `addEventListener`, nunca `onclick="...${atletica}..."` — bypass de XSS via `&#39;`
- **SRI nos CDNs** — se atualizar versão do Supabase ou html2canvas, recalcular hash SHA-384 e atualizar `integrity=` no `index.html`

---

## Arquivos críticos

- **`js/data.js`** — TEAM_PALETTES (9 times), TEAM_COLORS, TEAM_TEXT_COLORS, BRACKETS, SPORT_NAMES
- **`js/state.js`** — `applyTeamTheme()`, `resetTeamTheme()`, estado global, Supabase client, save/load, guards setWinner/setCheer
- **`js/auth/admin.js`** — `isAdmin`, `submitAdminLogin()` com verificação de `app_metadata.is_admin`
- **`js/auth/user.js`** — login de usuário normal, menu avatar, `currentUser`
- **`js/render/utils.js`** — `escHtml()`, `teamAvatar()`, `abbreviate()` — carregado antes dos outros render scripts
- **`js/render/simulacoes.js`** — toda a lógica de renderização da aba Simulações
- **`js/render/standings.js`** — pódio e tabela geral
- **`js/render/bracket.js`** — chaveamento eliminatório
- **`css/variables.css`** — todas as CSS custom properties padrão (tema default terracota)
- **`index.html`** — estrutura HTML completa, ordem dos scripts, SRI nos CDNs, mobile nav fora do header
- **`css/layout.css`** — `.shell { isolation: isolate }` — crítico para stacking do menu mobile
- **`css/components.css`** — header, mobile nav, backdrop, modais, user avatar dropdown
- **`js/config.js`** — credenciais Supabase (no `.gitignore`, não commitar)

---

## Próximos passos sugeridos

1. Reconectar Vercel ao GitHub e fazer o primeiro deploy com todas as mudanças (sessões 1 e 2)
2. Validar o fix do overlay mobile no dispositivo físico
3. Fazer rodada de testes mobile completa: cada atlética logada → navegar por todas as abas → verificar theming, cores de cabeçalhos nas Simulações, contraste
4. Se o deploy estiver ok, compartilhar o link com os participantes para teste real
