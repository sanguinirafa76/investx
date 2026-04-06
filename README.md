<div align="center">
    
## INVESTX
<br>
    <br>
Omega IA . v1.0

</div>
<br>
<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-dc2626?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)

**Plataforma web de investimentos com IA conversacional, dados de mercado em tempo real, simulador de carteira e análise técnica — tudo em front-end puro, sem frameworks, pronto para deploy em um clique.**

[Demo ao vivo](#) · [Reportar Bug](../../issues) · [Sugerir Feature](../../issues)

</div>

---

## Índice

- [Visão Geral](#-visão-geral)
- [Funcionalidades](#-funcionalidades)
- [Stack & Arquitetura](#-stack--arquitetura)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Como Rodar Localmente](#-como-rodar-localmente)
- [Configurando a OMEGA IA](#-configurando-a-omega-ia)
- [Deploy no Vercel](#-deploy-no-vercel)
- [Módulos em Detalhe](#-módulos-em-detalhe)
- [Trechos de Código](#-trechos-de-código)
- [Conta Demo](#-conta-demo)
- [Design & Tema](#-design--tema)
- [Contribuindo](#-contribuindo)
- [Autor](#-autor)
- [Licença](#-licença)

---

## Visão Geral

&nbsp;&nbsp;A plataforma **InvestX** nasceu para apoiar pessoas apaixonadas por investimentos, com a missão de democratizar o acesso à análise financeira por meio da inteligência artificial.

&nbsp;&nbsp;Com tecnologia avançada e sistemas de proteção de dados de alto nível, a **InvestX** oferece análises confiáveis, rápidas e baseadas em dados reais, permitindo que investidores tomem decisões com mais segurança e precisão.

&nbsp;&nbsp;Nossa proposta une inovação tecnológica e transparência, garantindo que cada usuário tenha acesso a ferramentas inteligentes, seguras e acessíveis, independentemente do seu nível de experiência no mercado financeiro. Em vez de depender de plataformas caras ou análises genéricas, o usuário tem em mãos uma ferramenta que combina:

- Cotações ao vivo da **B3, criptomoedas e índices globais** atualizadas a cada 30 segundos
- Um assistente de IA (**OMEGA IA**, powered by Groq IA) especializado em finanças brasileiras, com contexto de mercado em tempo real injetado automaticamente em cada conversa
- Simulador de investimentos com cálculo de juros compostos e aportes mensais (DCA)
- Dashboard de portfólio com acompanhamento de posições, rentabilidade e alertas de preço

> O projeto foi construído inteiramente com **HTML, CSS e JavaScript puro** — sem React, sem Vue, sem bundlers. Isso mantém o código acessível para qualquer desenvolvedor e o deploy trivial. Serve também como estudo de como construir SPAs sem dependências externas.

---

## Funcionalidades

### 🏠 Landing Page
- Ticker contínuo com cotações em tempo real (B3 + Cripto)
- Cards de ativos com variação do dia atualizada via Yahoo Finance API
- Mockup animado do dashboard com relógio em tempo real
- CTA para cadastro e acesso à conta demo

### 📊 Dashboard
- Patrimônio total, rentabilidade do dia e do mês
- Gráfico de evolução do portfólio (Canvas API)
- Cards de mercado: Ações, FIIs, Criptomoedas e Índices (IBOV, S&P 500)
- Score de IA para cada ativo (0–100) com sinal de COMPRAR / MANTER / ATENÇÃO / VENDER
- Atualização automática a cada **30 segundos**

### 🤖 OMEGA IA (Chat)
- Assistente conversacional especializado em investimentos brasileiros e globais
- Contexto de mercado injetado em tempo real antes de cada mensagem
- Análise técnica: MM20, RSI, MACD, Bollinger Bands, Volume
- Análise fundamentalista: P/L, P/VP, ROE, EBITDA, Dividend Yield
- FIIs: DY mensal, P/VP, vacância, tipos (papel / tijolo / híbrido)
- Criptomoedas: análise on-chain, sentimento, narrativas de mercado
- Renda Fixa: Selic, CDI, IPCA+, Tesouro Direto, CDB, LCI/LCA
- Macro: impacto de juros, câmbio e PIB nos ativos
- Responde perguntas gerais (tecnologia, ciência, etc.) além de finanças

### 💼 Portfólio
- Cadastro de posições com preço médio e quantidade
- Cálculo automático de resultado (lucro/prejuízo em R$ e %)
- Diversificação visual por classe de ativo

### 📈 Negociar (Trading Simulado)
- Ordens simuladas de compra e venda
- Tipos de ordem: mercado, limitada, stop e stop-gain
- Histórico completo de ordens com data, ativo, tipo, quantidade, preço e total
- Toast de confirmação após cada ordem executada
- **Simulador DCA** com juros compostos, aportes mensais e comentário da IA sobre o ativo

### 🔔 Alertas
- Configuração de alertas de preço por ativo
- Notificação quando o ativo atinge o gatilho definido

### 👤 Perfil & Configurações
- Upload de avatar (base64, sem servidor)
- Edição de nome, e-mail e perfil de investidor (conservador / moderado / arrojado)
- Gerenciamento da chave de API Anthropic com status visual
- Exportação dos dados do usuário em JSON
- Exclusão de conta com confirmação

---


## Estrutura do Projeto

```
InvestX/
├── 📁 HTML/
│   ├── Home.html          # Landing page pública (ticker, hero, depoimentos)
│   ├── index.html         # Dashboard principal (SPA — todos os módulos aqui)
│   ├── login.html         # Tela de login com validação em tempo real
│   └── register.html      # Cadastro com upload de avatar e validação
│    
│
├── 📁 JS/
│   ├── app.js             # Core global: fetchRealPrice(), formatPrice(), YF_MAP
│   ├── auth.js            # Register, login, sessão, API key, perfil, múltiplas contas
│   ├── chat.js            # OMEGA IA: histórico, system prompt, injeção de contexto
│   ├── market.js          # Cotações Yahoo Finance, fallback, score de ativos
│   ├── chart.js           # Gráficos de ativos via Canvas API
│   ├── trading.js         # Ordens simuladas, simulador DCA, análise por ativo
│   ├── home.js            # Scripts da landing: ticker loop, preços ao vivo
│   ├── index.js           # Init do dashboard, portfólio, alertas, navegação SPA
│   ├── login.js           # Validação do formulário de login
│   ├── perfil.js          # Edição de perfil, avatar, exportação de dados
│   ├── ui.js              # Sidebar, topbar, overlay, navegação entre seções
│   └── config.js          # Configurações, status da API key, exclusão de conta
│
├── 📁 CSS/
│   ├── style.css          # Estilo geral entre páginas, variáveis CSS, componentes
│   ├── auth.css           # Estilos de login e cadastro
│   ├── login.css          # Estilos adicionais para a parte de Login 
│   ├── profile.css        # Estilos no perfil do usuário
│   ├── register.css       # Estilos adicionais para a parte de cadastro
│   └── home.css           # Estilos e animações da landing page
│
└── vercel.json            # Rotas, rewrites e configuração do proxy serverless
```

---

## Como Rodar Localmente

### Pré-requisitos

- Qualquer navegador moderno (Chrome, Firefox, Edge, Safari)
- **Nenhuma** instalação de Node, npm ou bundler necessária

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/investx.git
cd investx
```

### 2. Inicie um servidor local

```bash
# Opção A — npx serve 
npx serve .

# Opção B — Python (já vem instalado na maioria dos sistemas)
python3 -m http.server 8080

# Opção C — VS Code com extensão Live Server
# Clique com botão direito em HTML/Home.html → "Open with Live Server" (recomendado)
```

> ⚠️ Abrir o `index.html` diretamente pelo sistema de arquivos (`file://`) pode causar erros de CORS nas chamadas à API do Yahoo Finance. Use sempre um servidor local.

### 3. Acesse no navegador

```
http://localhost:8080/HTML/Home.html
```

### 4. Faça login com a conta demo

```
E-mail : demo@investx.com
Senha  : demo123
```

---

## Configurando a OMEGA IA

A OMEGA IA requer uma chave de API da Groq para funcionar. O fluxo foi desenhado para **nunca expor a chave no cliente em produção**:

```
Browser  →  Vercel Serverless Function (/api/chat)  →  Groq API
                           ↑
              API key armazenada como variável de ambiente no Vercel
              Nunca chega ao navegador do usuário
```

### Obtendo sua chave

1. Acesse [chat.groq.com](https://console.groq.com)
2. Crie uma conta ou faça login
3. Vá em **API Keys → Create Key**
4. Copie a chave gerada (começa com `gsk_...`)


### Como o contexto de mercado é injetado

&nbsp;A cada mensagem enviada pelo usuário, o `chat.js` monta automaticamente um snapshot das cotações atuais e o injeta no `system prompt` enviado à IA:

```javascript
// chat.js — buildMarketContext()
function buildMarketContext() {
  const acoes  = currentMarketData.acoes.slice(0, 3)
    .map(r => `${r.tick} ${r.price} (${r.chg})`).join(', ');

  const cripto = currentMarketData.cripto.slice(0, 2)
    .map(r => `${r.tick} ${r.price} (${r.chg})`).join(', ');

  const ibov = currentMarketData.indices[0];

  return `\n\nDados de mercado em tempo real (${new Date().toLocaleString('pt-BR')}):\n`
       + `Ações: ${acoes}\n`
       + `Criptos: ${cripto}\n`
       + `IBOV: ${ibov?.price} (${ibov?.chg})`;
}
```

&nbsp;O resultado é que a IA responde com **dados do dia atual**, não com valores genéricos de treinamento.

---

## Deploy no Vercel

O projeto inclui `vercel.json` com rewrites configurados para o proxy da API.

### Passo a passo

```bash
# 1. Instale o CLI do Vercel
npm i -g vercel

# 2. Faça login
vercel login

# 3. Deploy de preview
vercel

# 4. Deploy em produção
vercel --prod
```

### Variáveis de ambiente necessárias

| Variável | Descrição | Exemplo |
|---|---|---|
| `GROQ_API_KEY` | Chave de API da Groq | `gsk_...` |

<br>
Configure via CLI:

```bash
vercel env add GROQ_API_KEY production
# Cole sua chave quando solicitado
```

Ou pelo dashboard do Vercel em **Settings → Environment Variables**.

---

## Módulos em Detalhe

### `app.js` — Core Global

&nbsp;Carregado em todas as páginas. Contém as funções base de sessão, integração com Yahoo Finance e utilitários de formatação:

```javascript
// Busca cotação real via Yahoo Finance (CORS público)
async function fetchRealPrice(symbol) {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1m&range=1d`;
    const res  = await fetch(url, { mode: 'cors' });
    if (!res.ok) throw new Error('fail');
    const json      = await res.json();
    const result    = json.chart?.result?.[0];
    const price     = result.meta?.regularMarketPrice;
    const prevClose = result.meta?.previousClose || result.meta?.chartPreviousClose;
    const chg       = prevClose ? ((price - prevClose) / prevClose * 100) : 0;
    return { price, chg, up: chg >= 0 };
  } catch {
    return null; // fallback para dados estáticos em market.js
  }
}

// Mapeamento de tickers para símbolos do Yahoo Finance
const YF_MAP = {
  'PETR4':  'PETR4.SA',  'VALE3':  'VALE3.SA',  'ITUB4':  'ITUB4.SA',
  'BBDC4':  'BBDC4.SA',  'WEGE3':  'WEGE3.SA',  'MGLU3':  'MGLU3.SA',
  'MXRF11': 'MXRF11.SA', 'HGLG11': 'HGLG11.SA',
  'BTC':    'BTC-USD',   'ETH':    'ETH-USD',    'SOL':    'SOL-USD',
  'IBOV':   '^BVSP',     'NASDAQ': '^IXIC',
};
```

### `auth.js` — Autenticação & Sessão

&nbsp;Sistema de múltiplas contas no `localStorage`. Suporta registro com foto (base64), login, sessão persistente e conta demo:

```javascript
// Suporte a múltiplas contas no mesmo navegador
function getAllAccounts() {
  try { return JSON.parse(localStorage.getItem('investx_accounts')) || []; }
  catch { return []; }
}

// Registro — valida campos, verifica e-mail duplicado, salva conta
function handleRegister(e) {
  e.preventDefault();
  // ... validações ...
  const user = {
    name, email, pass,
    initials:  name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase(),
    avatar:    document.getElementById('avatarPreview')?.dataset.avatarData || null,
    createdAt: new Date().toISOString()
  };
  saveAccount(user);
  localStorage.setItem('investx_user', JSON.stringify(user));
  window.location.href = '/HTML/index.html';
}

// Login demo — acesso rápido sem cadastro
if (email === 'demo@investx.com' && pass === 'demo123') {
  const demoUser = { name: 'Victor Ferreira', email, initials: 'VF', avatar: null };
  localStorage.setItem('investx_user', JSON.stringify(demoUser));
  window.location.href = '/HTML/index.html';
  return;
}
```

### `chat.js` — OMEGA IA

&nbsp;Mantém histórico completo da conversa, monta o `system prompt` especializado e injeta contexto de mercado em tempo real antes de cada requisição à API:

```javascript
const SYSTEM_PROMPT = `Você é a OMEGA IA, assistente da plataforma InvestX.

ESPECIALIDADES FINANCEIRAS:
• Ações B3: análise técnica (MM, RSI, MACD, Bollinger), fundamentalista (P/L, P/VP, ROE, EBITDA, DY)
• FIIs: tipos (papel, tijolo, híbrido), DY mensal, P/VP, vacância, gestoras
• Criptomoedas: Bitcoin, Ethereum, altcoins, análise on-chain, sentimento
• Renda Fixa: Selic, CDI, IPCA+, Tesouro Direto, CDB, LCI/LCA, debêntures
• Macro: Selic, inflação, câmbio, PIB e impacto nos ativos
• Internacional: S&P 500, Nasdaq, ETFs globais, BDRs

REGRAS DE COMPORTAMENTO:
• Responda sempre em português do Brasil, tom profissional mas acessível
• Use **negrito** para destacar ativos, valores, percentuais e termos-chave
• NUNCA dê ordens diretas de compra/venda — apresente como análise
• Máximo 2–4 parágrafos, salvo quando o usuário pedir mais detalhes
• Use os dados de mercado em tempo real disponíveis no contexto`;
```

### `trading.js` — Simulador de Investimentos

&nbsp;O simulador calcula o valor futuro com juros compostos sobre o aporte inicial mais a soma dos aportes mensais (DCA), cada um capitalizado pelo tempo restante:

```javascript
function runSimulation() {
  const anos       = parseInt(periodoSel.value) || 5;
  const aporte     = parseFloat(aporteSel.value) || 0;
  const annualRet  = parseFloat(parts[2]) || 0.10;  // retorno histórico anualizado do ativo
  const taxaMensal = Math.pow(1 + annualRet, 1 / 12) - 1;
  const meses      = anos * 12;

  // Montante inicial com juros compostos
  let valorFinal = valor * Math.pow(1 + annualRet, anos);

  // Soma dos aportes mensais, cada um capitalizado pelo tempo restante
  let totalInvestido  = valor;
  let valorAportes    = 0;
  for (let m = 1; m <= meses; m++) {
    valorAportes  += aporte * Math.pow(1 + taxaMensal, meses - m);
    totalInvestido += aporte;
  }

  valorFinal   += valorAportes;
  const lucro   = valorFinal - totalInvestido;
  const rentPct = (lucro / totalInvestido) * 100;
}
```

### `market.js` — Dados de Mercado

&nbsp;Busca todas as cotações de uma vez, com dados de fallback para garantir que o dashboard nunca fique vazio caso a API falhe:

```javascript
// Fallback completo caso a API do Yahoo Finance esteja indisponível
const MKT_FALLBACK = {
  acoes: [
    { tick:'PETR4', name:'Petrobras PN',  price:'R$37,48', chg:'+2.30%', score:82, signal:'COMPRAR', up:true  },
    { tick:'VALE3', name:'Vale ON',        price:'R$62,14', chg:'-0.80%', score:55, signal:'ATENÇÃO', up:false },
    { tick:'WEGE3', name:'WEG ON',         price:'R$48,70', chg:'+0.90%', score:88, signal:'COMPRAR', up:true  },
    // ...
  ],
  cripto: [
    { tick:'BTC', name:'Bitcoin',  price:'R$430.800', chg:'+4.70%', score:91, signal:'COMPRAR', up:true },
    { tick:'ETH', name:'Ethereum', price:'R$22.100',  chg:'+2.90%', score:84, signal:'COMPRAR', up:true },
    // ...
  ],
  // ...
};
```

---

## Conta Demo

Para explorar a plataforma sem criar uma conta própria:

```
E-mail : demo@investx.com
Senha  : demo123
```

A conta demo inclui:

- Portfólio de exemplo com posições em PETR4, WEGE3, MXRF11 e BTC
- Histórico de ordens simuladas pré-preenchido
- Alertas de preço configurados
- Acesso completo a todas as telas e funcionalidades

> A **OMEGA IA** requer uma chave de API própria da Anthropic, mesmo na conta demo. O restante da plataforma funciona sem nenhuma chave.

---

## 🎨 Design & Tema

&nbsp; O InvestX foi projetado com um **dark theme financeiro** inspirado em terminais de trading profissionais. As cores e tipografia foram escolhidas para maximizar legibilidade em sessões longas de análise:

```css
/* ── Paleta principal ── */
  --black:     #050506;
  --dark:      #0d0d0f;
  --card:      #111114;
  --border:    #1e1e24;
  --red-deep:  #8b0000;
  --red-mid:   #b91c1c;
  --red-bright:#dc2626;
  --red-glow:  #ef4444;
  --red-neon:  #ff2222;
  --gray:      #6b7280;
  --light:     #d1d5db;
  --white:     #f9fafb;                */

/* ── Tipografia ── */
/* Bebas Neue       — logotipo e títulos de seção                    */
/* Rajdhani         — corpo de texto e elementos de UI               */
/* Share Tech Mono  — tickers, valores, preços e dados de mercado    */
```

---

## Contribuindo

&nbsp;Contribuições são bem-vindas! Se você tem uma sugestão que tornaria o projeto melhor, abra uma issue ou envie um pull request.

```bash
# 1. Faça um fork do projeto
# 2. Crie sua branch de feature
git checkout -b feature/minha-feature

# 3. Commit com mensagem descritiva
git commit -m 'feat: adiciona gráfico de candlestick interativo'

# 4. Push para a branch
git push origin feature/minha-feature

                    OU
# 5. Abra um Pull Request descrevendo as mudanças
```

### Roadmap / Ideias abertas

- [ ] Integração com API oficial da B3
- [ ] Gráfico de candlestick interativo (OHLC)
- [ ] Notificações push para alertas de preço (Service Worker)
- [ ] Modo claro (light theme)
- [ ] Backend real com autenticação (Node.js / Supabase)
- [ ] Suporte a BDRs e ETFs nacionais
- [ ] Aba de Chat/Ligações para comunicação com Coachs e outros investidores
- [ ] Adição de valores reais do próprio usuário


---

## Autor

<div align="center">

Desenvolvido por **Rafael Sanguini Colagrossi**

<br>

&nbsp;&nbsp;&nbsp;
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat&logo=linkedin&logoColor=white)](https://linkedin.com/in/seu-perfil)
&nbsp;
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat&logo=github&logoColor=white)](https://github.com/seu-usuario)
&nbsp;
[![Portfolio](https://img.shields.io/badge/Portfolio-dc2626?style=flat&logo=vercel&logoColor=white)](#)
&nbsp;
[![Gmail](https://img.shields.io/badge/rafaelcolagrossi%40gmail.com-D14836?style=flat&logo=gmail&logoColor=white)](mailto:rafaelcolagrossi@gmail.com)

</div>

---

## Licença

Distribuído sob a **Licença MIT**. Consulte o arquivo [`LICENSE`](LICENSE) para mais detalhes.

```
MIT License — Copyright (c) 2025 Rafael Sanguini Colagrossi

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software.
```

---

<div align="center">

**Se este projeto te ajudou, deixa uma ⭐ no repositório — significa muito!**

`InvestX · OMEGA IA · sanguinirafa76`

</div>

