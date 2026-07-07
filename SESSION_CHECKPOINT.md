# SESSION_CHECKPOINT — Humaniadas 2026
> Gerado em: 2026-07-07 (sessão 3)

## Estado atual do app

**Funcionando:**
- Sistema de theming completo por atlética (9 times) — bg, accent, gold, text, textDim, textMid aplicados no login via `applyTeamTheme()`
- Tema padrão (visitante/admin): light mode branco/cinza com header vermelho `#CC1020` — identidade visual Humaniadas
- Logo oficial Humaniadas (`img/logo.jpg`) no loader e no nav header
- Loader: fundo slate neutro + watermark SPUFF 5% opacidade + logo animada
- Aba Geral: pódio + tabela de standings com hover e zeros temáticos
- Aba Chaveamentos: bracket eliminatório com scores
- Aba Cheerleading: lista de posições com selects, layout mobile ajustado
- Aba Simulações: lista vertical com expansão inline, dots de completion, cabeçalhos com cor da atlética simulada
- Menu mobile: backdrop + nav fora do header, `position: fixed`, z-index 9999/9998, `isolation: isolate` no `.shell`
- Login/logout com reset de tema (`--text` agora incluído no reset)
- Deploy em produção: humaniadas-2026.vercel.app — build via `node build.js` com env vars do Vercel
- Segurança: XSS bloqueado, admin guard correto, SRI nos CDNs, `config.js` no `.gitignore`

**Pendente de validação:**
- Testes mobile end-to-end em todas as abas com login de cada atlética
- Fluxo visitante (sem login) no mobile
- Validar overlay do menu mobile no dispositivo físico

---

## Decisões tomadas

- **Decisão:** Theming global por atlética via CSS custom properties no `:root`
  **Motivo:** Identidade visual distinta por time ao logar; sem build step
  **Status:** definitivo

- **Decisão:** Separar `TEAM_COLORS` de `themeAccent` de `gold`
  **Motivo:** HOTUR UFF e RI UFRJ têm cor primária navy ilegível como texto; themeAccent resolve isso
  **Status:** definitivo

- **Decisão:** Tema padrão (visitante/admin) é light mode com header vermelho `#CC1020`
  **Motivo:** Identidade visual Humaniadas é vermelho + branco (confirmado pelo Instagram do evento); dark mode com bg vermelho destruía o contraste
  **Status:** definitivo

- **Decisão:** `applyTeamTheme()` agora seta `--text: #F0E8DE` (claro)
  **Motivo:** Com o default em light mode (`--text: #111111`), sem override o texto ficaria preto sobre fundos escuros das atléticas
  **Status:** definitivo

- **Decisão:** `resetTeamTheme()` agora remove `--text` além das outras variáveis
  **Motivo:** Garantir que ao deslogar o texto reverta para preto do light mode
  **Status:** definitivo

- **Decisão:** Header fixo vermelho `#CC1020` com texto/tabs brancos — não usa `var(--bg)` nem CSS var para o bg do header
  **Motivo:** Header deve manter identidade Humaniadas mesmo quando temas escuros de atléticas são aplicados ao body
  **Status:** definitivo

- **Decisão:** Logo do evento em `img/logo.jpg` (não `.png`) — salvo pelo usuário
  **Motivo:** Arquivo foi salvo como JPEG pelo usuário
  **Status:** definitivo

- **Decisão:** Deploy via `vercel.json` + `build.js` — gera `config.js` de env vars no build
  **Motivo:** `config.js` está no `.gitignore`; Vercel precisa gerar o arquivo em build time
  **Status:** definitivo

- **Decisão:** `isAdmin` inicializado como `false`; admin verificado via `app_metadata.is_admin`
  **Motivo:** Segurança — bug anterior dava admin a todos quando DB offline
  **Status:** definitivo

- **Decisão:** Filter pills nas Simulações usam `data-atletica` + `addEventListener`
  **Motivo:** `escHtml("'")` → `&#39;` é decodificado antes de executar JS inline — bypass de XSS
  **Status:** definitivo

- **Decisão:** SRI nos dois CDNs externos (`@supabase/supabase-js@2.110.1` e `html2canvas@1.4.1`)
  **Motivo:** Garante integridade dos arquivos CDN
  **Status:** definitivo

- **Decisão:** Cabeçalhos das colunas em `simDetailTable` usam `TEAM_PALETTES[sim.atletica].themeAccent`
  **Motivo:** `var(--accent)` usava cor do usuário logado, não da atlética simulada
  **Status:** definitivo

- **Decisão:** `.mobile-nav` fora do `<header>` com `position: fixed`
  **Motivo:** `backdrop-filter` no header quebra `position: fixed` em alguns browsers
  **Status:** definitivo

- **Decisão:** `isolation: isolate` no `.shell`
  **Motivo:** Sem stacking context explícito, conteúdo aparecia acima do overlay do menu mobile
  **Status:** definitivo

---

## Trabalho concluído nesta sessão

### Sessão 3 (identidade visual + deploy)
- **`css/variables.css`** — tema padrão migrado de terracota escuro → light mode branco/cinza com accent vermelho `#CC1020`; `--text: #111111` para fundos claros
- **`css/components.css`** — header vermelho `#CC1020` com sombra; tabs/brand/auth-btn brancos; loader com watermark SPUFF + logo como `<img>`; tab hover usa `var(--accent-dim)`
- **`js/state.js`** — `applyTeamTheme()` seta `--text: #F0E8De`; `resetTeamTheme()` remove `--text`
- **`index.html`** — loader usa `<img src="img/logo.jpg">` em vez de `<div>H</div>`; nav header usa `img/logo.jpg`
- **`vercel.json`** — adicionado `buildCommand` e `outputDirectory`
- **`build.js`** — criado: gera `js/config.js` a partir de env vars `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `CHAMPIONSHIP_ID`
- **`README.md`** — criado com estrutura do projeto, stack, tabela de atléticas, convenções

### Sessão 2 (segurança + paleta)
- **`js/auth/admin.js`** — `isAdmin = false`; verificação de `app_metadata.is_admin`; `window.location.replace()` após login
- **`js/state.js`** — removido `viewingSimulacao`; guards em `setWinner`/`setCheer`/`resetAll()`
- **`js/render/utils.js`** — `escHtml()`; `teamAvatar()` com escaping
- **`js/render/simulacoes.js`** — `escHtml()` em todos os dados do DB; filter pills com data-attributes; `simDetailTable` com `headerColor` da atlética simulada
- **`js/render/standings.js`**, **`bracket.js`**, **`main.js`**, **`auth/user.js`** — `escHtml()` em todos os pontos de innerHTML
- **`.gitignore`** — `js/config.js`
- **`index.html`** — SRI nos CDNs; Supabase pinado em `@2.110.1`

### Sessão 1 (theming + layout)
- TEAM_PALETTES completo; `applyTeamTheme()`/`resetTeamTheme()`; layout Simulações reescrito; menu mobile fixo

---

## Pendências (em ordem de prioridade)

- [ ] Testes visuais mobile de todas as 9 atléticas logadas (theming, contraste, legibilidade)
- [ ] Validar transição light mode → dark mode atlética no mobile (especialmente header que fica sempre vermelho)
- [ ] Validar overlay do menu mobile no dispositivo físico (`isolation: isolate`)
- [ ] Testar fluxo visitante (sem login) no mobile
- [ ] Fazer novo deploy no Vercel com as mudanças da sessão 3 (commitar e fazer push)

---

## Bugs conhecidos

- **Overlay menu mobile sobre cheer items**: corrigido com `isolation: isolate` no `.shell` — aguarda validação no dispositivo físico.

---

## Convenções do projeto que não podem ser esquecidas

- **Sem build step, sem npm** — HTML estático com CDN Supabase. Ordem dos `<script>` em `index.html` é crítica.
- **Commits manuais** — nunca usar git via ferramentas. O usuário commita depois de testar no browser.
- **Logo:** `img/logo.jpg` (JPEG, não PNG)
- **Header sempre vermelho `#CC1020`** — hardcoded no `.top` em `components.css`, não usa CSS var; mantém identidade mesmo com temas escuros
- **Theming de atlética:** `applyTeamTheme()` deve sempre setar `--text: #F0E8DE` (claro) para dark themes; `resetTeamTheme()` deve remover `--text`
- **`themeAccent`** (não `accent`) para CSS `--accent`; `accent` pode ser cor escura ilegível
- **`--accent-rgb`** derivado de `themeAccent` — usado em `rgba(var(--accent-rgb), opacity)`
- **`TEAM_TEXT_COLORS`** = cor do texto na linha destacada da tabela de Simulações
- **`simDetailTable` cabeçalhos** = `TEAM_PALETTES[sim.atletica].themeAccent`, não `var(--accent)`
- **`goldDim`** no TEAM_PALETTES é hex string, não rgba()
- **Admin** identificado por `app_metadata.is_admin = true` no JWT; segurança real é RLS
- **RLS ativo** em todas as tabelas Supabase
- **`isolation: isolate` no `.shell`** — não remover
- **`.mobile-nav` fora do `<header>`** — não mover de volta
- **`escHtml()` obrigatório** em todo dado do banco antes de innerHTML
- **Filter pills:** `data-atletica` + `addEventListener`, nunca `onclick` com dados do banco
- **SRI nos CDNs** — recalcular SHA-384 ao atualizar versão de qualquer CDN
- **Vercel env vars:** `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `CHAMPIONSHIP_ID` — necessárias para o build

---

## Arquivos críticos

- **`js/data.js`** — TEAM_PALETTES (9 times), TEAM_COLORS, TEAM_TEXT_COLORS, BRACKETS, SPORT_NAMES
- **`js/state.js`** — `applyTeamTheme()` (seta --text claro), `resetTeamTheme()` (remove --text), estado global, Supabase client
- **`js/auth/admin.js`** — `isAdmin`, `submitAdminLogin()` com verificação de `app_metadata.is_admin`
- **`js/auth/user.js`** — login de usuário normal, menu avatar, `currentUser`
- **`js/render/utils.js`** — `escHtml()`, `teamAvatar()`, `abbreviate()`
- **`js/render/simulacoes.js`** — toda a lógica da aba Simulações
- **`css/variables.css`** — tema padrão light mode (visitante/admin): bg claro, accent vermelho, text preto
- **`css/components.css`** — header vermelho hardcoded, loader, mobile nav, modais
- **`index.html`** — estrutura HTML, ordem dos scripts, SRI nos CDNs, logo.jpg
- **`css/layout.css`** — `.shell { isolation: isolate }` — crítico para stacking do menu mobile
- **`vercel.json`** + **`build.js`** — deploy Vercel com geração de config.js via env vars
- **`img/logo.jpg`** — logo oficial do evento (não commitar versão errada)
- **`js/config.js`** — credenciais Supabase (no `.gitignore`, nunca commitar)

---

## Próximos passos sugeridos

1. Commitar mudanças da sessão 3 e fazer push para o Vercel redesploiar
2. Testar no mobile: transição de light mode (visitante) → dark mode atlética ao logar
3. Verificar header vermelho no mobile com cada atlética logada
4. Validar todas as 9 atléticas: theming, contraste, legibilidade
