# SESSION_CHECKPOINT — Humaniadas 2026
> Gerado em: 2026-07-07

## Estado atual do app

**Funcionando:**
- Sistema de theming completo por atlética (9 times) — bg, accent, gold, textDim, textMid aplicados no login via `applyTeamTheme()`
- Aba Geral: pódio + tabela de standings com hover e zeros temáticos
- Aba Chaveamentos: bracket eliminatório com scores
- Aba Cheerleading: lista de posições com selects, layout mobile ajustado
- Aba Simulações: lista vertical com expansão inline, dots de completion de esporte por participante
- Menu mobile: backdrop + nav fora do header, `position: fixed`, z-index 9999/9998, `isolation: isolate` no `.shell`
- Login/logout com reset de tema

**Parcialmente implementado:**
- Theming mobile: cores aplicadas mas não validadas visualmente em todas as atléticas no mobile
- Dots de completion na aba Simulações: mostram esportes preenchidos, não acertos vs resultado real (intencional)

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

- **Decisão:** Padding horizontal mobile unificado em 16px (`top-inner`, `.shell`, `.mobile-tab`)
  **Motivo:** Shell tinha 14px, header tinha 24px — conteúdo e header desalinhados no mobile
  **Status:** definitivo

---

## Trabalho concluído nesta sessão

- **`js/data.js`** — TEAM_PALETTES completo para 9 atléticas; RI UFRJ backgrounds alterados para charcoal-aço
- **`js/state.js`** — `applyTeamTheme()` e `resetTeamTheme()` com todas as variáveis CSS (`--accent-rgb`, `--bg`, `--bg-panel`, `--bg-card`, `--bg-card-hover`, `--accent`, `--accent-dim`, `--accent-dark`, `--line`, `--line-strong`, `--gold`, `--gold-dim`, `--gold-glow`, `--text-dim`, `--text-mid`)
- **`css/podium.css`** — Removidos 3 hardcodes laranja: gradiente p1 (`#201208` → `var(--bg-card-hover)`), hover da tabela (`rgba(200,112,42,0.04)` → `rgba(var(--accent-rgb),0.06)`), zeros (`#3A2A1E` → `rgba(var(--accent-rgb),0.20)`)
- **`css/sports.css`** — Hardcodes de laranja removidos; `.sport-card.done` com `var(--gold)`; `.sport-badge::before` com `var(--text-dim)` em vez de amarelo
- **`css/simulacoes.css`** — Reescrito: layout com `.sim-group`, cards full-width, `.sim-sport-dots`, expansão inline restaurada, seta com rotação CSS
- **`js/render/simulacoes.js`** — Reescrito: `filledSports()`, `simUserCard()` com dots, `toggleSimDetail()` atualiza DOM diretamente (sem re-render da lista), `openDetailId` singleton
- **`css/cheerleading.css`** — Mobile: padding/gap reduzidos, avatar top-3 forçado para 40px via CSS
- **`index.html`** — `.mobile-nav` movido para fora do `<header>`; `<div class="nav-backdrop">` adicionado
- **`css/components.css`** — `.mobile-nav` → `position: fixed; z-index: 9999`; `.nav-backdrop` → `position: fixed; top/right/bottom/left: 0; z-index: 9998`; padding mobile unificado em 16px; `.mobile-tab` padding ajustado
- **`css/layout.css`** — `.shell { isolation: isolate }`; padding mobile 14px → 16px
- **`js/main.js`** — `toggleMobileMenu()` e `mobileNavTo()` sincronizam o `navBackdrop`

---

## Pendências (em ordem de prioridade)

- [ ] Reconectar Vercel ao GitHub e fazer deploy em produção (pendente desde sessão anterior)
- [ ] Validar overlay do menu mobile no dispositivo físico depois do `isolation: isolate` — confirmar que cheer items 4°/5° ficam atrás do backdrop
- [ ] Testes visuais mobile de todas as 9 atléticas logadas (theming, contraste, legibilidade)
- [ ] Testar fluxo visitante (sem login) no mobile — navegação, chaveamentos, geral
- [ ] Validar aba Simulações no mobile após mudanças de layout (dots visíveis, expansão correta, filtro)

---

## Bugs conhecidos

- **Overlay menu mobile sobre cheer items**: itens 4° e 5° da aba Cheerleading apareciam acima do overlay do menu mobile. Corrigido com `isolation: isolate` no `.shell` — aguarda validação no dispositivo físico.
- **`inset: 0` no backdrop**: substituído por `top/right/bottom/left: 0` explícitos por compatibilidade com iOS Safari antigo — já corrigido.

---

## Convenções do projeto que não podem ser esquecidas

- **Sem build step, sem npm** — HTML estático com CDN Supabase. Ordem dos `<script>` em `index.html` é crítica.
- **Commits manuais** — nunca usar git via ferramentas. O usuário commita depois de testar no browser.
- **Theming**: usar sempre `themeAccent` (não `accent`) para CSS `--accent`; `accent` pode ser cor escura ilegível (ex: HOTUR UFF #020684)
- **`--accent-rgb`** deve ser derivado de `themeAccent` (não de `accent`) — usado em `rgba(var(--accent-rgb), opacity)` no CSS
- **`TEAM_TEXT_COLORS`** = cor do texto na linha destacada da atlética na tabela de Simulações (legível sobre fundo colorido). Diferente de `themeAccent`.
- **`goldDim`** no TEAM_PALETTES é `string hex`, não `rgba()` — `applyTeamTheme` usa direto como `--gold-dim`
- **`BM_MATCH_H = 140`** em `bracket.js` — não alterar
- **Admin** identificado por `app_metadata.is_admin = true` no JWT
- **RLS ativo** em todas as tabelas Supabase
- **`isolation: isolate` no `.shell`** — não remover; garante que conteúdo da página fique abaixo dos overlays fixos (menu, modais)
- **`.mobile-nav` fora do `<header>`** — não mover de volta para dentro; `backdrop-filter` do header quebra `position: fixed/absolute` em alguns browsers

---

## Arquivos críticos

- **`js/data.js`** — TEAM_PALETTES (9 times), TEAM_COLORS, TEAM_TEXT_COLORS, BRACKETS, SPORT_NAMES
- **`js/state.js`** — `applyTeamTheme()`, `resetTeamTheme()`, estado global, Supabase client, save/load
- **`css/variables.css`** — todas as CSS custom properties padrão (tema default terracota)
- **`index.html`** — estrutura HTML completa, ordem dos scripts, mobile nav fora do header
- **`css/layout.css`** — `.shell { isolation: isolate }` — crítico para stacking do menu mobile
- **`css/components.css`** — header, mobile nav, backdrop, modais, user avatar dropdown
- **`js/render/simulacoes.js`** — toda a lógica de renderização da aba Simulações
- **`js/render/cheer.js`** — renderização da aba Cheerleading
- **`js/main.js`** — roteamento de views, toggleMobileMenu, showView

---

## Próximos passos sugeridos

1. Validar o fix do overlay mobile (menu sobre cheer items) no dispositivo físico ou no dev tools com o fix `isolation: isolate` em vigor
2. Reconectar Vercel ao GitHub e fazer o primeiro deploy com todas as mudanças desta sessão
3. Fazer rodada de testes mobile completa: cada atlética logada → navegar por todas as abas → verificar theming, contraste, menu
4. Se o deploy estiver ok, compartilhar o link com os participantes para teste real
