# InvestX — Plataforma de IA para Investimentos

<div align="center">

![INVESTIA Banner](https://img.shields.io/badge/ΩINVESTIA-Plataforma%20IA-dc2626?style=for-the-badge&labelColor=0d0d0f)

[![Version](https://img.shields.io/badge/versão-1.0.0-b91c1c?style=flat-square&labelColor=111114)](.)
[![License](https://img.shields.io/badge/licença-MIT-8b0000?style=flat-square&labelColor=111114)](LICENSE)
[![HTML](https://img.shields.io/badge/HTML5-single--file-dc2626?style=flat-square&logo=html5&logoColor=white&labelColor=111114)](.)
[![CSS](https://img.shields.io/badge/CSS3-vanilla-dc2626?style=flat-square&logo=css3&logoColor=white&labelColor=111114)](.)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-dc2626?style=flat-square&logo=javascript&logoColor=white&labelColor=111114)](.)
[![Responsivo](https://img.shields.io/badge/responsivo-✓-dc2626?style=flat-square&labelColor=111114)](.)

<br/>

> **Dashboard financeiro assistido por Inteligência Artificial**, com monitoramento de ativos, gráficos interativos e chat com IA — tudo em um único arquivo HTML, sem dependências de runtime.

<br/>

![Preview Desktop](https://img.shields.io/badge/Preview-Desktop-374151?style=flat-square) ![Preview Mobile](https://img.shields.io/badge/Preview-Mobile-374151?style=flat-square)

</div>

---

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Demo](#-demo)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Estrutura de Arquivos](#-estrutura-de-arquivos)
- [Instalação e Uso](#-instalação-e-uso)
- [Componentes](#-componentes)
- [Design System](#-design-system)
- [Responsividade](#-responsividade)
- [Lógica JavaScript](#-lógica-javascript)
- [Personalização](#-personalização)
- [Roadmap](#-roadmap)
- [Contribuindo](#-contribuindo)
- [Licença](#-licença)

---

## 🎯 Visão Geral

**InvestX** é uma plataforma web de dashboard financeiro assistida por IA, desenvolvida como aplicação *single-file* em HTML puro, CSS e JavaScript vanilla. O sistema simula um ambiente profissional de análise de investimentos inspirado no Bloomberg Terminal e Reuters Eikon.

### Objetivos

- Oferecer uma interface de investimentos de alto padrão visual e funcional
- Integrar chat com IA para suporte e análise em tempo real
- Ser 100% responsivo para desktop, tablet e mobile
- Funcionar como aplicação single-file (zero dependências externas de runtime)
- Servir como base extensível para integração com APIs financeiras reais

### Público-Alvo

| Perfil | Uso |
|--------|-----|
| **Investidores individuais** | Acompanhar portfólio com interface moderna |
| **Desenvolvedores** | Base de projeto para fintech e plataformas de investimento |
| **Designers UI/UX** | Referência de dashboard financeiro em dark mode |

---

## 🚀 Demo

```bash
# Clone e abra direto no browser — sem instalação
git clone https://github.com/seu-usuario/investia.git
open investia/index.html
```

Ou acesse via GitHub Pages: `https://seu-usuario.github.io/investia`

---

## ✨ Funcionalidades

### Dashboard
- [x] Barra superior fixa com ticker de mercado animado
- [x] Sidebar de navegação com índices em tempo real (IBOV, S&P500, BTC, USD/BRL)
- [x] 4 cards de métricas: Patrimônio, Rentabilidade, Score IA, Posições Abertas
- [x] Gráfico SVG interativo com 5 períodos (1D / 1S / 1M / 3M / 1A)
- [x] Cards de portfólio clicáveis (PETR4, VALE3, BTC)
- [x] Preço ao vivo com oscilação simulada a cada 2,5 segundos

### Chat com OMEGA IA
- [x] Mensagem inicial automática de boas-vindas personalizada
- [x] Indicador de digitação animado (3 pontos wave)
- [x] Chips de sugestão rápida (Análise, Alertas, Sugestões)
- [x] Textarea com auto-resize e suporte a Shift+Enter
- [x] 8 respostas rotativas com análises de mercado simuladas
- [x] Timestamps em cada mensagem

### UX / Interface
- [x] Tema dark com paleta exclusiva em tons de vermelho e preto
- [x] Efeito scanlines (overlay CRT)
- [x] Animações: glow neon, sheen, pulse, ticker scroll
- [x] Layout totalmente responsivo (5 breakpoints)
- [x] Sidebar e chat como gavetas deslizantes no mobile

---

## 🛠️ Tecnologias

### Core (zero dependências)

| Tecnologia | Finalidade |
|------------|------------|
| HTML5 | Estrutura semântica |
| CSS3 (Custom Properties, Grid, Flexbox) | Layout, animações, responsividade |
| JavaScript ES6+ (Vanilla) | Lógica de UI, chat, gráfico SVG |
| SVG | Renderização de gráficos financeiros |

### Tipografia (Google Fonts)

| Fonte | Estilo | Uso |
|-------|--------|-----|
| [Bebas Neue](https://fonts.google.com/specimen/Bebas+Neue) | Display / Condensed | Logotipo, títulos, overlay de gráfico |
| [Rajdhani](https://fonts.google.com/specimen/Rajdhani) | Sans-serif semi-condensed | Texto de interface, botões, labels |
| [Share Tech Mono](https://fonts.google.com/specimen/Share+Tech+Mono) | Monospace | Dados financeiros, preços, timestamps |

---

## 📁 Estrutura de Arquivos

> A versão atual é **single-file** (`index.html`). A estrutura abaixo representa a arquitetura recomendada ao expandir o projeto para produção.

```
investia/
├── index.html                  ← Arquivo principal (single-file app)
├── README.md                   ← Documentação do projeto
├── LICENSE
│
├── assets/
│   ├── css/
│   │   ├── main.css            ← Estilos globais e variáveis CSS
│   │   ├── dashboard.css       ← Layout do dashboard fixo
│   │   ├── chat.css            ← Componente de chat
│   │   ├── chart.css           ← Estilos do gráfico SVG
│   │   └── responsive.css      ← Media queries / breakpoints
│   │
│   ├── js/
│   │   ├── main.js             ← Entry point e inicialização
│   │   ├── chat.js             ← Lógica do chat com IA
│   │   ├── chart.js            ← Renderização SVG e animações
│   │   ├── market.js           ← Dados de mercado e ticker
│   │   └── ui.js               ← Sidebar, responsividade, tabs
│   │
│   └── fonts/                  ← Fontes locais (fallback offline)
│       ├── BebasNeue.woff2
│       ├── Rajdhani.woff2
│       └── ShareTechMono.woff2
│
├── components/                 ← (versão modular futura)
│   ├── Topbar.html
│   ├── Sidebar.html
│   ├── MetricsRow.html
│   ├── ChartPanel.html
│   ├── PortfolioCards.html
│   └── ChatPanel.html
│
├── api/                        ← (integração backend futura)
│   ├── market-data.js          ← Fetch de cotações reais
│   ├── ai-responses.js         ← Integração com LLM/GPT/Gemini
│   └── portfolio.js            ← CRUD de posições
│
└── docs/
    ├── screenshots/
    │   ├── desktop.png
    │   ├── tablet.png
    │   └── mobile.png
    └── CHANGELOG.md
```

### Descrição dos Diretórios

| Diretório | Descrição |
|-----------|-----------|
| `assets/css/` | Estilos separados por componente. `main.css` define as variáveis CSS globais |
| `assets/js/` | Scripts separados por responsabilidade — cada módulo tem escopo único |
| `assets/fonts/` | Cópias locais das fontes para funcionamento offline sem CDN |
| `components/` | Fragmentos HTML reutilizáveis para versão modular (Web Components ou framework) |
| `api/` | Módulos de integração com serviços externos: cotações, IA e CRUD de portfólio |
| `docs/` | Screenshots, changelog e materiais de suporte ao projeto |

---

## ⚙️ Instalação e Uso

### Opção 1 — Abrir direto no browser

```bash
git clone https://github.com/seu-usuario/investia.git
cd investia
open index.html          # macOS
start index.html         # Windows
xdg-open index.html      # Linux
```

### Opção 2 — Servidor local (recomendado)

```bash
# Python
cd investia && python -m http.server 8080

# Node.js
npx serve investia

# VS Code
# Instale a extensão "Live Server" e clique em "Open with Live Server"
```

Acesse em: `http://localhost:8080`

### Opção 3 — GitHub Pages

1. Vá em **Settings** → **Pages** no seu repositório
2. Selecione a branch `main` e pasta raiz `/`
3. Acesse via `https://seu-usuario.github.io/investia`

---

## 🧩 Componentes

### Topbar — Barra Superior

Barra fixa no topo, sempre visível em todos os dispositivos.

| Elemento | Descrição |
|----------|-----------|
| Logo ΩINVESTIA | Ícone com animação sheen e símbolo Ω com glow vermelho |
| Ticker de Mercado | Faixa animada com cotações (PETR4, VALE3, BTC, ETH...) |
| Status da IA | Indicador pulsante mostrando se a IA está ativa |
| Avatar do Usuário | Iniciais com gradiente vermelho |
| Botões Mobile | Hambúrguer (sidebar) e chat — visíveis apenas em ≤ 900px |

### Sidebar — Navegação Lateral

Painel esquerdo fixo em desktop, gaveta deslizante no mobile.

- **Navegação:** Dashboard, Portfólio, Mercado, Análise IA, Alertas, Perfil, Configurações
- **Mini Índices:** IBOV, S&P500, BTC/USD e USD/BRL com direção ▲ / ▼
- **Mobile:** Desliza da esquerda com overlay. Fecha ao navegar ou tocar fora

### Cards de Métricas

Linha de 4 cards no topo do dashboard, reorganizados em 2×2 em telas menores.

| Card | Dado | Comportamento |
|------|------|---------------|
| Patrimônio Total | R$ 48.320 | Variação diária destacada |
| Rentabilidade Mês | +8,4% | Comparativo com CDI |
| Score IA | 87/100 | Avaliação do portfólio pela IA |
| Posições Abertas | 12 | Contagem e alertas ativos |

> Cada card tem animação de borda vermelha superior ao hover (`scaleX: 0 → 1` em 0.3s).

### Gráfico SVG Interativo

Renderizado em SVG puro, sem bibliotecas externas.

| Feature | Descrição |
|---------|-----------|
| Linha Principal | Gradiente vermelho com `drop-shadow` de glow |
| Área Preenchida | Gradiente vertical com opacidade 25% → 0% |
| Grid de Fundo | Linhas horizontais e verticais em `#1a1a1f` |
| Períodos | 5 abas: 1D / 1S / 1M / 3M / 1A com dados próprios |
| Preço ao Vivo | Valor oscila a cada 2,5s simulando cotação real |

### Chat com OMEGA IA

Painel lateral direito com 320px em desktop, gaveta da direita no mobile.

```
┌─────────────────────────────┐
│  Ω OMEGA IA  · analisando.. │  ← Header com status animado
├─────────────────────────────┤
│                             │
│  [IA] Olá, Victor! 👋       │  ← Mensagem inicial automática
│  Precisa de ajuda hoje?     │
│                       09:41 │
│                             │
│            [Usuário] Sim! ► │  ← Bolha do usuário (gradiente vermelho)
│                       09:42 │
│                             │
│  [· · ·]                    │  ← Indicador de digitação
│                             │
├─────────────────────────────┤
│ 📊 Análise  🔴 Ativos  ⚡   │  ← Chips de sugestão
├─────────────────────────────┤
│  [Digite sua pergunta...] ► │  ← Input + botão enviar
└─────────────────────────────┘
```

---

## 🎨 Design System

### Paleta de Cores

```css
:root {
  --black:      #050506;  /* Background principal */
  --dark:       #0d0d0f;  /* Topbar, sidebar, chat */
  --card:       #111114;  /* Cards, inputs, bolhas */
  --border:     #1e1e24;  /* Separadores sutis */

  --red-deep:   #8b0000;  /* Vermelho profundo — fundos */
  --red-mid:    #b91c1c;  /* Vermelho médio — bordas, hovers */
  --red-bright: #dc2626;  /* Vermelho principal — botões */
  --red-glow:   #ef4444;  /* Vermelho claro — preços, status */
  --red-neon:   #ff2222;  /* Efeitos de glow e sombra */

  --gray:       #6b7280;  /* Textos secundários */
  --light:      #d1d5db;  /* Texto de corpo */
  --white:      #f9fafb;  /* Texto principal */
}
```

### Animações e Efeitos

| Nome | Tipo | Descrição |
|------|------|-----------|
| `scanlines` | CSS overlay | Linhas horizontais `repeating-linear-gradient`, textura CRT |
| `sheen` | `@keyframes` | Reflexo deslizante no logo: `left: -100% → 150%` |
| `pulse` | `@keyframes` | Dot de status: `scale + opacity` alternados |
| `ticker` | `@keyframes` | Scroll contínuo: `translateX(100% → -100%)` em 20s |
| `msgIn` | `@keyframes` | Entrada de mensagem: `opacity 0→1, translateY(8px→0)` em 0.3s |
| `typingDot` | `@keyframes` | Wave dos 3 pontos com `animation-delay` de 0.2s entre cada |
| `blink` | `@keyframes` | Cursor piscante no status da IA |

---

## 📱 Responsividade

Layout adaptativo com CSS Grid + Flexbox, sem frameworks externos.

| Breakpoint | Faixa | Comportamento |
|------------|-------|---------------|
| Desktop | > 1100px | Layout completo: sidebar + dashboard + chat lado a lado |
| Laptop | ≤ 1100px | Ticker oculto, métricas em grade 2×2 |
| Tablet | ≤ 900px | Sidebar e chat viram gavetas, botões mobile aparecem |
| Mobile | ≤ 640px | Portfólio em coluna única, padding reduzido, logo menor |
| Mobile XS | ≤ 400px | Valores de métricas compactados |

> **Mobile:** Sidebar e chat usam `position: fixed` com `transform: translateX(±100%)`. Um overlay com `backdrop-filter: blur` aparece ao abrir qualquer gaveta. `closeAll()` é chamado ao tocar fora.

---

## 💻 Lógica JavaScript

### Algoritmo do Gráfico SVG

```javascript
function drawChart(key) {
  const data = chartData[key]; // ex: chartData['1D']
  const min = Math.min(...data), max = Math.max(...data);

  const pts = data.map((v, i) => {
    const x = PAD + (i / (data.length - 1)) * (W - PAD * 2);
    const y = BOT + ((max - v) / (max - min)) * (H - BOT * 2);
    return [x, y];
  });

  const linePath = 'M' + pts.map(p => p.join(',')).join('L');
  const areaPath = linePath + `L${pts.at(-1)[0]},${H - BOT} L${pts[0][0]},${H - BOT} Z`;

  document.getElementById('chartLine').setAttribute('d', linePath);
  document.getElementById('chartArea').setAttribute('d', areaPath);
}
```

### Fluxo do Chat

```
1. Usuário digita → pressiona Enter ou clica Enviar
2. appendMessage(text, isUser=true)  → bolha vermelha à direita
3. showTyping()                      → 3 pontos animados aparecem
4. setTimeout(1000–1800ms)           → simula processamento da IA
5. hideTyping()                      → remove os pontos
6. appendMessage(response, false)    → bolha da IA à esquerda
7. msgCount++                        → rotaciona resposta do array
```

### Gerenciamento de Painéis

```javascript
// Abre sidebar (fecha chat se estiver aberto)
function toggleSidebar() {
  sidebar.classList.toggle('open');
  chatPanel.classList.remove('open');
  overlay.classList.toggle('show', sidebar.classList.contains('open'));
}

// Fecha tudo (chamado ao tocar no overlay)
function closeAll() {
  sidebar.classList.remove('open');
  chatPanel.classList.remove('open');
  overlay.classList.remove('show');
}
```

---

## 🔧 Personalização

### Alterar nome do usuário

No arquivo `index.html`, localize a primeira chamada de mensagem e altere o nome:

```javascript
// Antes
appendMessage("Olá, <strong>Victor</strong>! ...", false);

// Depois
appendMessage("Olá, <strong>Seu Nome</strong>! ...", false);
```

### Alterar paleta de cores

```css
/* No bloco :root { } no início do <style> */
--red-bright: #dc2626;  /* Substitua pelo hex desejado */
--red-glow:   #ef4444;
```

### Adicionar respostas da IA

```javascript
const responses = [
  "Sua análise personalizada aqui...",
  "Outro insight de investimento...",
  // adicione quantas quiser
];
```

### Conectar a uma API real

```javascript
// Substitua os dados estáticos por fetch
async function fetchPrice(ticker) {
  const res = await fetch(`https://brapi.dev/api/quote/${ticker}`);
  const data = await res.json();
  return data.results[0].regularMarketPrice;
}
```

---

## 🗺️ Roadmap

### v1.1 — Dados Reais
- [ ] Integração com [Brapi.dev](https://brapi.dev) ou Alpha Vantage para cotações reais
- [ ] WebSocket para atualização em tempo real sem polling
- [ ] `localStorage` para salvar portfólio e preferências

### v1.2 — IA Real
- [ ] Integração com OpenAI / Gemini com contexto do portfólio
- [ ] Análise de sentimento de notícias financeiras
- [ ] Indicadores técnicos: RSI, MACD, Bandas de Bollinger

### v2.0 — Plataforma Completa
- [ ] Backend Node.js com API REST
- [ ] Banco de dados PostgreSQL para histórico de trades
- [ ] Autenticação com JWT e OAuth (Google / Microsoft)
- [ ] PWA para instalação no mobile
- [ ] Notificações push via service worker

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Siga os passos:

```bash
# 1. Fork o repositório
# 2. Crie sua branch
git checkout -b feature/minha-feature

# 3. Commit suas mudanças
git commit -m "feat: adiciona nova funcionalidade"

# 4. Push para a branch
git push origin feature/minha-feature

# 5. Abra um Pull Request
```

### Padrão de commits

```
feat:     Nova funcionalidade
fix:      Correção de bug
style:    Mudanças de estilo/CSS
refactor: Refatoração de código
docs:     Atualização de documentação
```

---

## 📄 Licença

Este projeto está licenciado sob a **MIT License** — veja o arquivo [LICENSE](LICENSE) para detalhes.

```
MIT License — você pode usar, copiar, modificar e distribuir livremente,
desde que mantenha o aviso de copyright original.
```

---

## 🏆 Créditos

| Item | Fonte |
|------|-------|
| Tipografia | [Google Fonts](https://fonts.google.com) — Bebas Neue, Rajdhani, Share Tech Mono |
| Inspiração Visual | Bloomberg Terminal, Reuters Eikon, Binance Pro |
| Desenvolvido com | [Claude](https://claude.ai) — Anthropic |

---

<div align="center">

**InvestX** — Feito com ❤️ e muito ☕

[![GitHub stars](https://img.shields.io/github/stars/seu-usuario/investia?style=social)](https://github.com/seu-usuario/investia)
[![GitHub forks](https://img.shields.io/github/forks/seu-usuario/investia?style=social)](https://github.com/seu-usuario/investia/fork)

</div>