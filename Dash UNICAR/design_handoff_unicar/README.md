# Handoff: UNICAR — Sistema Web de Gestão para Oficina Mecânica

## Overview

UNICAR é um sistema web de gestão (ERP) para uma oficina mecânica de médio porte. O sistema cobre o fluxo operacional completo: dashboard, ordens de serviço, orçamentos, cadastro de clientes/veículos, financeiro (contas a receber) e catálogo de peças e serviços. O objetivo é transmitir profissionalismo e confiança, com toque industrial moderno: superfícies limpas, fontes sem serifa, bordas finas, sem gradientes.

## About the Design Files

Os arquivos neste pacote são **referências de design feitas em HTML/React (Babel inline)** — protótipos hi-fi mostrando a aparência e comportamento pretendidos, **não código de produção para copiar diretamente**.

A tarefa é **recriar esses designs no ambiente do codebase de destino** usando os padrões e bibliotecas estabelecidos (React + TypeScript, Vue, SvelteKit, etc.). Se ainda não existe codebase, recomendamos:
- **Frontend:** React + TypeScript + Vite + Tailwind CSS + shadcn/ui (rápido, bem documentado, casa com a estética minimalista do design)
- **State / data:** TanStack Query + Zustand (ou Redux Toolkit)
- **Forms:** React Hook Form + Zod
- **Backend:** A definir — não está no escopo deste handoff

## Fidelity

**Hi-fi.** As cores, tipografia, espaçamentos e interações são finais. O desenvolvedor deve recriar pixel-perfeito usando as bibliotecas do codebase. Os arquivos HTML usam Inter (Google Fonts), JetBrains Mono e Architects Daughter — esta última é apenas para anotações nos wireframes e **não deve aparecer no produto final**.

---

## Design Tokens

### Cores (paleta UNICAR)
| Token            | Valor       | Uso |
|------------------|-------------|-----|
| `--red`          | `#E31E2D`   | Cor primária / call-to-action / total / destaque crítico |
| `--red-soft`     | `rgba(227,30,45,0.08)` | Background de focus rings, pills "open"/"late" |
| `--black`        | `#111111`   | Sidebar, header de documento, texto principal |
| `--paper`        | `#FAF9F7`   | Background de superfície do conteúdo |
| `--paper-2`      | `#F0EEE9`   | Background do app (cinza quente — fundo geral solicitado `#F5F4F2` aproximado) |
| `--ink`          | `#1A1A1A`   | Texto principal sobre fundo claro |
| `--ink-2`        | `#4A4A4A`   | Texto secundário |
| `--ink-3`        | `#8A8A8A`   | Texto terciário / placeholder / muted |
| `--line`         | `#CFCCC6`   | Bordas de input |
| `--line-2`       | `#E3E0D9`   | Bordas de cards e divisórias principais |
| `--line-3`       | `#EBE8E2`   | Bordas internas em tabelas |
| `--fill`         | `#F4F2ED`   | Fundo de header de tabela / botões disabled |
| `--fill-2`       | `#ECEBE6`   | Fundo de pills neutros |

### Cores semânticas (status)
| Status        | Background                        | Foreground   |
|---------------|-----------------------------------|--------------|
| Aberta        | `rgba(227,30,45,0.10)`            | `#C0192A`    |
| Em execução   | `rgba(245,158,11,0.12)`           | `#B25E09`    |
| Aguardando    | `rgba(99,102,241,0.10)`           | `#4F46D6`    |
| Concluída/Pago| `rgba(16,136,74,0.10)`            | `#0D6E3D`    |
| Vencido       | `rgba(227,30,45,0.10)`            | `#C0192A`    |
| Vence hoje    | `rgba(245,158,11,0.12)`           | `#B25E09`    |
| Inativo       | `#ECEBE6`                          | `#8A8A8A`    |

### Day-pills (indicador de urgência por dias)
- 0–1 dias → **verde** (`rgba(16,136,74,0.12)` / `#0D6E3D`)
- 2–3 dias → **âmbar** (`rgba(245,158,11,0.16)` / `#B25E09`)
- 4+ dias → **vermelho** (`rgba(227,30,45,0.14)` / `#C0192A`)

### Typography
- **UI:** Inter (400, 500, 600, 700, 800, 900) — Google Fonts
- **Mono / códigos / números tabulares:** JetBrains Mono
- Tamanhos: 10.5/11/11.5/12/12.5/13/14/15/16/19/20/22/24/26/28/38 px
- Letter-spacing: `-0.03em` para wordmarks, `-0.02em` para títulos grandes, `0.06em` para labels uppercase, `0.12em` para uppercase muito pequeno
- Linha: 1.4 (texto), 1.5 (parágrafos), 1.6 (multi-linha em formulários)
- `font-variant-numeric: tabular-nums` em valores monetários, IDs de OS, datas, kms

### Spacing
- Base: 4 px. Escala: 4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32 px
- Padding interno de cards: 12/14/16/20 (compact/regular/comfy)
- Padding de tabelas: 7/11/14 px (compact/regular/comfy)
- Gap entre cards: 12 (compact) / 16 (regular)

### Border radius
- Inputs/botões: **5 px**
- Cards: **6 px**
- Pills: **999 px** (full)
- Modais e documentos: **8 px**
- Avatar: **50%**

### Shadows (modo hi-fi)
- `0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)` — frame
- `0 1px 2px rgba(0,0,0,0.03)` — card
- `0 24px 80px rgba(0,0,0,0.30)` — modal

### Iconografia
Outline, stroke 1.5 px, size 16 px (default). Inline SVG. Lista completa de ícones usados em `components/primitives.jsx` (função `Icon`): `dashboard, wrench, car, users, doc, cash, box, chart, gear, plus, search, bell, calendar, arrow-up, arrow-down, check, chevron, menu, filter, download, print, whatsapp, edit, trash, eye, alert, clock, flag, dots, phone, mail, pin, logout, arrow-left, sliders`.

**Recomendação:** trocar por **lucide-react** no codebase real (todos os equivalentes existem). Ex.: `wrench`→`Wrench`, `car`→`Car`, `box`→`Package`, `cash`→`CreditCard`, `dots`→`MoreHorizontal`, `whatsapp`→ usar SVG custom (lucide não tem).

---

## Logo

**Conceito escolhido: C · Velocímetro** (`MarkSpeed` em `components/logos.jsx`).

Estrutura:
- Círculo preto `#111` Ø 56 px
- Arco branco semi-circular (gauge) com stroke 3 px
- Arco vermelho `#E31E2D` parcial (1/3 inicial) com stroke 4 px
- Ponteiro vermelho diagonal 32→44 / 38→22
- Pivô branco Ø 6 px

**Wordmark:** "UNI" em `#111` + "CAR" em `#E31E2D`, Inter 900, letter-spacing `-0.03em`. Subtítulo opcional: "AUTO CENTER · EST. 2008" em Inter 400, tracking 0.34em, `#666`.

**Versões:** horizontal (logo + wordmark), ícone quadrado em fundo preto, branco e vermelho.

---

## Screens / Views

### 1. Layout base (todas as telas autenticadas)

**Estrutura:** Sidebar fixa à esquerda (220 px expandida / 56 px recolhida) + área principal flex-1.

- **Sidebar** (`#111` / `#0F0F0F`):
  - Topo: logo (mark + wordmark "UNI**CAR**") com border-bottom em `rgba(255,255,255,0.08)`
  - Nav agrupado por seções (uppercase 9.5 px, `#6A6864`, tracking 0.12em):
    - **(sem seção)** Dashboard
    - **OPERAÇÃO**: Ordens de Serviço, Orçamentos, Agenda
    - **CADASTROS**: Clientes, Veículos, Peças e Serviços
    - **FINANCEIRO**: Financeiro, Relatórios
    - **SISTEMA**: Configurações
  - Item ativo: background `rgba(227,30,45,0.14)`, ícone vermelho, texto branco
  - Item hover: background `rgba(255,255,255,0.04)`
  - Rodapé: avatar + nome do usuário + role + ícone de logout
  - **Recolhida:** apenas ícones, tooltips no hover (a implementar)

- **Top bar** (h ~52 px, `#FFF`, border-bottom `--line-2`):
  - Esquerda: breadcrumbs com ícone de calendário + data atual + título da página
  - Direita: busca global (240 px, ícone de lupa à esquerda), botão de notificações, ações primárias da página

### 2. Dashboard (V3 · Kanban-first) — escolhido

`DashboardV3` em `components/dashboard.jsx`.

**Top hero (4 colunas, 1.4fr 1fr 1fr 1fr):**
1. **Faturamento card** (largo): label uppercase, valor 26 px peso 800, delta verde "▲ 12% vs. março", mini bar-chart 12 barras (h 50 px), última barra em vermelho. Botão "Mês ▾" no canto.
2. **OS concluídas:** "62 / 80" com barra de progresso 78%
3. **Veículos ativos:** "8" com sub "2 prontos retirada"
4. **A receber:** "R$ 14,8k" com sub "4 boletos / 7 dias", ícone vermelho

**Quadro Kanban** (4 colunas em grid):
- **Abertas** (vermelho `#C0192A`, bg `rgba(227,30,45,0.05)`)
- **Em execução** (âmbar `#B25E09`, bg `rgba(245,158,11,0.06)`)
- **Aguardando peça** (índigo `#4F46D6`, bg `rgba(99,102,241,0.05)`)
- **Prontas** (verde `#0D6E3D`, bg `rgba(16,136,74,0.05)`)

Cada coluna: header com dot colorido + título + contagem; cards de OS empilhados.

**Card de OS no Kanban:**
- Topo: número da OS (mono, 11.5 px) + avatar do técnico
- Cliente em 12 px peso 600
- Veículo + placa em 10.5 px muted
- Serviço em 11 px
- Footer com border-top: "há Xd" + valor à direita

**Interação:** drag-and-drop entre colunas (usar `@dnd-kit/core`). Mover card muda status da OS na API.

### 3. Nova Ordem de Serviço (Modal) — escolhido

`NovaOSModal` em `components/nova-os.jsx`.

- **Overlay:** dashboard atrás com `filter: blur(2px) brightness(0.95)` + camada `rgba(20,20,20,0.45)`
- **Modal:** inset `top:30 right:60 bottom:30 left:60`, radius 8 px, shadow `0 24px 80px rgba(0,0,0,0.30)`
- **Header do modal:**
  - Esquerda: título "Nova Ordem de Serviço" + status "Rascunho · auto-salvo há 3s"
  - Direita: 3 botões — "Salvar rascunho" (secundário), "Gerar Orçamento" (secundário), "Iniciar OS" (primário vermelho), botão fechar (✕)

**Formulário (2 colunas: 1fr / 320 px sticky):**

Coluna esquerda (cards empilhados):
1. **Identificação** — grid 4 colunas: Nº OS (auto, disabled), Data, Cliente (autocomplete com lupa), Status (select). Linha 2: Veículo (vinculado ao cliente), Km atual, Tipo de serviço, Prazo estimado. Textarea: "Problema relatado pelo cliente"
2. **Serviços** — tabela inline (descrição, qtd, valor unit, total) + botão "Adicionar serviço" como tr borda dashed
3. **Peças utilizadas** — tabela (código mono, descrição, qtd, unit, total) + botão "Adicionar peça do estoque"
4. **Observações internas** — textarea

Coluna direita (sticky top: 16):
1. **Totals** — bg `--fill`, linhas: subtotal serviços, subtotal peças, desconto (vermelho), divider, **Total geral** em 22 px peso 800 vermelho
2. **Equipe e prazo** — Técnico responsável (input com avatar), Auxiliares (chips removíveis + botão +), Garantia (dias)
3. **Histórico do veículo** — lista compacta das últimas 3 OS

### 4. Cadastro de Cliente

`ClienteScreen`. Header: avatar 56 px + nome + ícones com CPF/telefone/email + 3 estatísticas à direita (Ordens, Histórico R$, Veículos).

**Abas:** Dados Pessoais · Endereço · Veículos · Histórico
- Tab ativa: border-bottom 2 px vermelho, texto vermelho, peso 600

**Tab 1 (Dados Pessoais):** Grid 2 colunas. Card "Tipo de pessoa" com toggle PF/PJ. Card "Contato" com email/telefone/celular + checkbox "Aceita comunicações por WhatsApp"

**Tab 2 (Endereço):** Form com auto-preenchimento via ViaCEP. Campos: CEP, Rua, Número, Complemento, Bairro, Cidade, Estado.

**Tab 3 (Veículos):** Tabela (placa mono, modelo, marca, ano, cor, km, combustível) + botão primário "Adicionar veículo".

**Tab 4 (Histórico):** Tabela com OS anteriores (número, data, serviço, veículo, status pill, valor).

### 5. Orçamento

`OrcamentoScreen`. Visual de **documento imprimível**: 820 px de largura, fundo branco, padding 40/48 px, sombra leve.

- **Header:** logo + dados da empresa à esquerda, "ORÇAMENTO #ORC-1182" à direita com data emissão e validade. Border-bottom 2 px preto.
- **Cliente + Veículo** em 2 colunas
- **Tabela de serviços** (descrição, qtd, unit, total)
- **Tabela de peças** (código, descrição, qtd, unit, total)
- **Totais** alinhados à direita (320 px), divider preto sólido 1 px, total em 24 px peso 800 vermelho
- **Observações** + assinaturas (cliente / loja)
- Top bar com botões: Imprimir, Enviar por WhatsApp, **Aprovar e gerar OS** (primário)

### 6. Financeiro · Contas a Receber

`FinanceiroScreen`. Sub-abas no topo: "Contas a Receber" (ativo), "Contas a Pagar", "Fluxo de Caixa", "Comissões".

- **4 cards de resumo:** Total a receber, Vencidos (sub vermelho), Vence em 7 dias (sub âmbar), Recebidos no mês (delta verde)
- **Filtros:** busca + período (Hoje/7d/30d/Personalizado) + pills de contagem por status (Pendente · 12, Vencido · 4, Pago · 18) + Exportar
- **Tabela:** checkbox, OS, cliente (com avatar), valor (right), vencimento + status legível ("Vencido há 2 dias"), pill de status, ações (Lembrete + Receber primário; Ver recibo se pago)

### 7. Peças e Serviços

`PecasScreen`. Header: "Peças e Serviços · 486 itens cadastrados" + botões "Exportar" e **"Adicionar Peça ou Serviço"** (primário).

- **4 métricas:** Peças cadastradas (com sub vermelho "32 com estoque baixo"), Serviços, Valor em estoque, Margem média (delta verde)
- **Filtros:** busca por nome/código + selects (Grupo, Tipo Peça/Serviço, Situação) + Mais filtros
- **Tabela:** Código (mono muted), Nome (com alerta de estoque crítico abaixo se aplicável), Grupo, Tipo (pill índigo "Peça" ou pill vermelho "Serviço"), Unidade, Custo, Venda, Estoque (vermelho se crítico), Situação (Ativo verde / Inativo cinza), menu de ações
- **Paginação** no rodapé

### 8. Mobile (3 telas críticas)

Todas em frame 360×720 px, radius 32 px, notch superior.

- **Dashboard mobile:** header com saudação, hero card preto com faturamento + mini bar-chart, grid 2 col de métricas, card de pendências, tab bar inferior (Início, OS, Novo [+] redondo vermelho, Clientes, Mais)
- **Nova OS mobile (wizard):** progress bar 3 px no topo (75%), recap de cliente colapsado, lista de serviços como cards stacked, total fixo, footer com Voltar / Continuar
- **Financeiro mobile:** 2 cards (Total / Vencidos), filtros horizontais scrolláveis, lista de títulos com border-left colorido por status (vermelho/âmbar/verde), ações Lembrar (WhatsApp) + Receber

---

## Interactions & Behavior

- **Auto-save:** rascunhos de OS salvam a cada 3 s; mostrar "Auto-salvo há Xs" no header do modal
- **Drag-and-drop Kanban:** mudar OS de coluna chama API `PATCH /os/:id/status`
- **Aprovar orçamento:** botão "Aprovar e gerar OS" cria uma OS automaticamente e redireciona
- **Auto-preenchimento CEP:** chamar ViaCEP em `onBlur` do campo CEP
- **Hover em linha de tabela:** background `--fill`
- **Focus em input:** border vermelho + ring `0 0 0 3px var(--red-soft)`
- **Pills:** dot de 6 px em `currentColor` à esquerda do texto
- **Day-pills:** mini-chip 22 px de altura, background tonal por urgência
- **Densidade:** três níveis (compact/regular/comfy) afetam padding de cards e linhas de tabela
- **Sidebar collapsed:** transição suave de 220→56 px

## State Management

Sugestão de stores Zustand (ou slices Redux):
- `authStore` — usuário logado, role, permissions
- `osStore` — lista de OS, filtros, status do board
- `clientesStore` — lista paginada, cliente em edição
- `pecasStore` — catálogo, filtros
- `financeiroStore` — títulos, filtros, totalizadores

TanStack Query para todas as fetches: `useOSList`, `useCliente(id)`, `useFinanceiroSummary`, etc.

## Forms / Validation (Zod)

Exemplos de schemas:

```ts
const NovaOSSchema = z.object({
  numero: z.string(), // auto-gerado
  data: z.string().date(),
  clienteId: z.string().uuid(),
  veiculoId: z.string().uuid(),
  kmAtual: z.number().int().nonnegative(),
  tipoServico: z.enum(['preventiva','corretiva','diagnostico']),
  problemaRelatado: z.string().min(10),
  servicos: z.array(z.object({
    descricao: z.string(),
    quantidade: z.number().positive(),
    valorUnit: z.number().nonnegative(),
  })).min(1),
  pecas: z.array(z.object({
    codigo: z.string(),
    descricao: z.string(),
    quantidade: z.number().positive(),
    valorUnit: z.number().nonnegative(),
  })),
  observacoesInternas: z.string().optional(),
  status: z.enum(['rascunho','aberta','progress','waiting','done']),
  tecnicoId: z.string().uuid(),
  prazoEstimado: z.string().date(),
});

const ClienteSchema = z.object({
  tipo: z.enum(['PF','PJ']),
  nome: z.string().min(3),
  documento: z.string().refine(isValidCPFOrCNPJ),
  dataNascimento: z.string().date().optional(),
  email: z.string().email().optional(),
  telefone: z.string().optional(),
  celular: z.string(),
  aceitaWhatsApp: z.boolean().default(false),
  endereco: z.object({
    cep: z.string().regex(/^\d{5}-?\d{3}$/),
    rua: z.string(),
    numero: z.string(),
    complemento: z.string().optional(),
    bairro: z.string(),
    cidade: z.string(),
    estado: z.string().length(2),
  }),
});
```

## Files

Arquivos de referência (todos neste pacote):
- `UNICAR Wireframes.html` — entry point, monta o canvas com todas as telas
- `wireframes.css` — todos os tokens e classes utilitárias (variáveis em `:root`)
- `components/primitives.jsx` — Icon, StatusPill, Avatar, DayPill, Note, Placeholder
- `components/logos.jsx` — MarkGear, MarkWrench, **MarkSpeed (escolhido)**, MarkAbstract, Wordmark, LogoExploration
- `components/sidebar.jsx` — Sidebar component + array NAV
- `components/dashboard.jsx` — DashboardV3 (escolhido), TopBar, MetricCard, MOCK_OS, STATUS_LABEL
- `components/nova-os.jsx` — NovaOSModal (escolhido), NovaOSForm, ItemTable, TotalsBlock, SERVICOS, PECAS
- `components/screens.jsx` — ClienteScreen, OrcamentoScreen, FinanceiroScreen, PecasScreen
- `components/mobile.jsx` — MobileDashboard, MobileNovaOS, MobileFinanceiro, MobileFrame

## Implementation Checklist

1. [ ] Setup do projeto (Vite + React + TS + Tailwind + shadcn/ui)
2. [ ] Configurar tokens no `tailwind.config.ts` (cores, fonts, radii)
3. [ ] Importar fonts Inter + JetBrains Mono via `index.html`
4. [ ] Implementar Logo MarkSpeed como componente SVG
5. [ ] Layout base: Sidebar + Topbar + Outlet
6. [ ] Componentes atômicos: Button (primary/secondary/ghost/sm/lg), Input, Select, Textarea, Pill, DayPill, Avatar, MetricCard
7. [ ] Dashboard V3 com Kanban (`@dnd-kit/core`)
8. [ ] Modal de Nova OS com auto-save e formulário 2 colunas
9. [ ] Cadastro de Cliente com 4 abas + ViaCEP
10. [ ] Tela de Orçamento (print-friendly via `@media print`)
11. [ ] Financeiro · Contas a Receber
12. [ ] Peças e Serviços (catálogo unificado peça/serviço)
13. [ ] Versões mobile (responsive, mas as 3 telas críticas têm layouts dedicados)
14. [ ] i18n: PT-BR como locale principal, números em pt-BR (`Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`), datas em `dd/MM/yyyy`

## Notas finais

- **Acessibilidade:** todos os ícones decorativos com `aria-hidden`; pills de status devem ter texto legível (não confiar só na cor); contraste atual passa em AA para todos os textos sobre fundo branco
- **Print:** a tela de Orçamento precisa de CSS `@media print` para esconder topbar e sidebar e expandir o documento para a página inteira
- **Tema escuro:** não previsto nesta v1; sidebar já é escura mas o resto do app é light
- **WhatsApp:** ícone está como SVG inline; integração de envio precisa de provedor (z-api, twilio, ou link `wa.me/<numero>?text=`)
