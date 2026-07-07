# SESSION_CHECKPOINT — Humaniadas 2026
> Gerado em: 2026-07-07

## Estado atual do app

**Funcionando:**
- Aba Geral: pódio + tabela de classificação com pontos por esporte e cheerleading
- Aba Chaveamentos: grid com toggle Masculino/Feminino (só mobile); desktop mostra ambos os gêneros lado a lado
- Aba Cheerleading: lista de colocações 1º–9º, editável por admin ou usuário logado
- Aba Simulações: lista agrupada por atlética (requer login), filtro por atlética (pills desktop / select mobile). Avatar usa logo da atlética. Clicar num card expande painel abaixo com tabela completa de standings. Paleta da atlética aplicada no painel (thead, células, linha dona, grupo label e painel com mesmo bg via CSS `:has()`)
- **Theming global por atlética:** ao logar, `--accent`, `--accent-dim`, `--line`, `--line-strong` são sobrescritos com a paleta da atlética do usuário. Resetado ao deslogar
- Auth: login/logout/cadastro com reload para home; admin via app_metadata.is_admin
- Hash routing: #geral, #chaveamentos, #cheerleading, #simulacoes, #bracket
- Toggle "Minha Simulação / Resultado Oficial" centralizado no mobile, oculto na aba Simulações
- Footer ancorado no rodapé

**Parcialmente implementado:**
- Theming global: implementado para todas as 9 atléticas. Cores definidas mas não testadas para todas (só SPUFF testado visualmente). Cores muito escuras (HOTUR `#020684`, RI UFRJ `#003374`) podem ter baixo contraste como `--accent` no dark theme — ajustar se necessário.

**Pendente de validação:**
- Comportamento visitante (sem login) em todas as abas
- Testes mobile end-to-end
- Validação visual do theming para cada atlética

---

## Decisões tomadas

- **SPA com hash routing** — definitivo
- **Paleta Terracota Universitário** (accent #C8702A, bg #14100D) — base; sobrescrita por atlética ao logar
- **Emojis removidos de elementos estruturais** — definitivo
- **CSS modularizado** em 9 arquivos por domínio — definitivo
- **Selects padronizados** — border: --border-input padrão, accent no focus/hover — definitivo
- **Reload completo** no login/logout/cadastro — definitivo
- **Toggle Masc/Fem em Chaveamentos** — só no mobile; desktop sempre mostra os dois gêneros lado a lado — definitivo
- **Simulações: painel expansível** (não nova aba) ao clicar num card — definitivo
- **Avatar de atlética** usa logo PNG de `img/teams/` — definitivo
- **Paleta por atlética na tabela expandida**: thead com tint rgba da cor primária + texto/Total na cor secundária (TEAM_TEXT_COLORS) + linha da dona destacada — definitivo
- **Theming global por atlética**: sobrescreve variáveis CSS `--accent` e derivadas no `documentElement` — definitivo
- **CSS `:has()` para grupo de simulação**: `.sim-group:has(.sim-user-detail[style*="block"])` aplica `var(--bg-panel)` ao grupo inteiro quando painel aberto — definitivo

---

## Arquivos alterados nesta sessão

| Arquivo | O que mudou |
|---|---|
| `js/data.js` | TEAM_COLORS: cores reais de todas as 9 atléticas; TEAM_TEXT_COLORS: completo para todas; adicionado TEAM_PALETTES com paleta completa (accent, accentAlt, text, aux, bg) |
| `js/state.js` | Adicionado `applyTeamTheme(atletica)` e `resetTeamTheme()` — sobrescrevem/limpam `--accent`, `--accent-dim`, `--accent-dark`, `--line`, `--line-strong` no documentElement |
| `js/auth/user.js` | `onSignIn`: chama `applyTeamTheme(profile.atletica)`; `onSignOut`: chama `resetTeamTheme()` |
| `js/render/simulacoes.js` | Reescrito: painel expansível com paleta completa da atlética; sim-group background via JS setProperty; sim-detail-table com cores por linha |
| `css/simulacoes.css` | `.sim-group:has(.sim-user-detail[style*="block"])`: bg-panel; `.team-col`: position:static + background:transparent + text-align:center; pills inativos: background:transparent |
| `css/sports.css` | gender-toggle mobile; ajuste padding/gap dos cards |
| `css/components.css` | `.view-toggle-inner` centralizado no mobile |

---

## Convenções que não podem ser esquecidas

- **Commits manuais:** nunca usar git via ferramentas
- **`BM_MATCH_H = 140`** em bracket.js — constante calibrada para mobile; não alterar
- **Admin** identificado por `app_metadata.is_admin = true` no JWT
- **Tabela `profiles`** usa coluna `id`; **`simulations`** usa `user_id` — não confundir
- **`var viewingSimulacao`** permanece declarado (var, escopo global) em simulacoes.js mas é sempre null
- **RLS ativo** em todas as tabelas
- **Sem build step, sem npm** — ordem dos scripts em index.html é crítica
- **`body { display: flex }` requer `width: 100%` no `.shell`**
- **Texto sobre accent (#C8702A):** usar `var(--bg)` (#14100D), nunca branco — ATENÇÃO: com theming, accents muito claros (amarelo RI UFF, AECS) vão precisar de texto escuro, não `var(--bg)`. Revisar se houver problema.
- **Logo das atléticas:** `img/teams/${name.toLowerCase().replace(/\s+/g,'_')}.png` — todas as 9 existem
- **TEAM_PALETTES**: accent = cor de destaque para theming global; text = cor de texto na linha destacada da sim table; aux = cores auxiliares da identidade

---

## Arquivos críticos

| Arquivo | Papel |
|---|---|
| `js/data.js` | TEAMS, BRACKETS, POINTS_BY_PLACEMENT, TEAM_COLORS, TEAM_TEXT_COLORS, TEAM_PALETTES |
| `js/state.js` | Estado global, applyTeamTheme/resetTeamTheme, loadState/saveState, setWinner, setCheer |
| `js/logic.js` | getMatches, computePlacements, computeGeneralStandings |
| `js/main.js` | showView, resolveHash, hash routing, openBracket |
| `js/auth/user.js` | initAuth, onSignIn (chama applyTeamTheme), onSignOut (chama resetTeamTheme) |
| `js/auth/admin.js` | isAdmin flag, submitAdminLogin, logoutAdmin |
| `js/render/simulacoes.js` | loadAllSimulations, renderSimulacoes, toggleSimDetail, simDetailTable |
| `js/render/bracket.js` | Render do bracket (BM_MATCH_H = 140 — não alterar) |
| `css/variables.css` | Todos os tokens de design (accent sobrescrito em runtime pelo theming) |
| `index.html` | Ordem dos `<link>` e `<script>` é crítica |

---

## Pendências (em ordem de prioridade)

- [ ] Testar theming visual para cada atlética — especialmente HOTUR UFF (#020684) e RI UFRJ (#003374) que são azuis muito escuros como --accent
- [ ] Testar fluxo visitante (sem login) em todas as abas
- [ ] Testes mobile end-to-end: burger nav, bracket scroll, avatar dropdown, toggle
- [ ] Reconectar Vercel ao GitHub para deploy em produção
- [ ] Convidar usuários de cada atlética para validar agrupamento na aba Simulações

## Bugs conhecidos

Nenhum bug ativo no momento.
