#  InvestX
### Plataforma de investimentos com IA · Motor OMEGA v3.2

![IA ATIVA](https://img.shields.io/badge/IA-ATIVA-dc2626?style=flat-square)
&nbsp;&nbsp;&nbsp;
![Stack](https://img.shields.io/badge/Stack-HTML·CSS·JS-1c1c22?style=flat-square)
&nbsp;&nbsp;&nbsp;
![Groq](https://img.shields.io/badge/Groq-LLaMA_3.3_70B-1c1c22?style=flat-square)
&nbsp;&nbsp;&nbsp;
![Yahoo Finance](https://img.shields.io/badge/API-Yahoo_Finance-1c1c22?style=flat-square)
&nbsp;&nbsp;&nbsp;
![Version](https://img.shields.io/badge/versão-v3.2-dc2626?style=flat-square)

---

## 01 — Visão Geral

&nbsp;&nbsp;**InvestX** é uma plataforma web de acompanhamento e análise de investimentos alimentada por inteligência artificial. O sistema monitora ativos em tempo real, gera insights automáticos e oferece um chat com a **OMEGA IA** — capaz de responder qualquer pergunta com foco no mercado financeiro brasileiro.

> 100% client-side. Nenhum backend necessário — basta abrir o `index.html` no navegador.

---

## 02 — Funcionalidades

| Módulo | Descrição |
|---|---|
| **⊞ Dashboard** | 6 cards de métricas (patrimônio, rentabilidade, Score IA, posições, dividendos, poder de compra). Gráfico interativo com tooltip por ativo. |
| **Ω OMEGA IA — Chat** | Chat em tempo real via Groq API (LLaMA 3.3 70B). Responde qualquer pergunta com foco em investimentos. Contexto de mercado injetado automaticamente. |
| **◈ Portfólio** | Tabela de posições abertas com preço médio, resultado e % da carteira. Gráfico de alocação por classe de ativo e histórico mensal. |
| **◉ Mercado** | Tabela ao vivo com ações B3, FIIs, criptomoedas e índices. Cotações reais via Yahoo Finance. Score OMEGA por ativo. |
| **⟁ Análise IA** | Score OMEGA do portfólio, insights diários automáticos e tabela de previsões para 7 dias com índice de confiança. |
| **⚡ Negociar** | Simulação de ordens de compra e venda, projeção de investimentos com juros compostos e histórico de ordens simuladas. |
| **🔔 Alertas** | Central de alertas por ativo com criação de novos alertas de preço, variação % e volume. Notificações da OMEGA IA. |
| **◎ Perfil & Conta** | Cadastro com foto, edição de perfil, seleção de risco (conservador → agressivo). Login com conta demo disponível. |

---

##  03 — Stack Utilizada

| Tecnologia | Uso | Tipo |
|---|---|---|
| **HTML · CSS · JS** | Interface completa, sem frameworks | `CORE` |
| **Groq API** | Chat da OMEGA IA — modelo LLaMA 3.3 70B | `IA` |
| **Yahoo Finance API** | Cotações em tempo real (ações, cripto, índices) | `DADOS` |
| **Bebas Neue · Share Tech Mono · Rajdhani** | Tipografia via Google Fonts | `UI` |
| **localStorage** | Persistência de usuário, contas e configurações | `STORAGE` |

---

##  04 — Estrutura de Arquivos

```
InvestX/
├── HTML/
│   ├── index.html       → Dashboard principal (app)
│   ├── Home.html        → Landing page (pré-login)
│   ├── login.html       → Tela de login
│   ├── register.html    → Cadastro de conta
│   ├── perfil.html      → Perfil do usuário
│   └── config.html      → Configurações
├── CSS/
│   ├── style.css        → Estilos globais e dashboard
│   ├── auth.css         → Estilos de login/cadastro
│   └── profile.css      → Estilos de perfil
├── JS/
│   └── app.js           → Toda a lógica da aplicação
└── Imagens/
    └── logo.png         → Logo do projeto
```

---

##  05 — Como Rodar

&nbsp;&nbsp;&nbsp;**01 — Clone ou baixe o projeto**
Extraia os arquivos e mantenha a estrutura de pastas intacta.

&nbsp;&nbsp;&nbsp;**02 — Abra o `Home.html` no navegador**
Nenhum servidor necessário. Funciona diretamente como arquivo local ou hospedado em qualquer servidor estático.

&nbsp;&nbsp;&nbsp;**03 — Crie uma conta ou use o acesso demo**
Conta demo: `demo@investx.com` · senha: `demo123`

&nbsp;&nbsp;&nbsp;**04 — Chat OMEGA IA já configurado**
A chave da API Groq já está embutida no `app.js`. O chat funciona imediatamente após o login.

---

##  06 — Conta Demo

| Campo | Valor |
|---|---|
| E-mail | `demo@investx.com` |
| Senha | `demo123` |
| Perfil | Victor Ferreira — Moderado |

---

##  07 — Autor

Projeto desenvolvido por **Rafael Sanguini Colagrossi**.

| Canal | Contato |
|---|---|
| 📧 E-mail | `rafaelcolagrossi@gmail.com` |
| 💼 LinkedIn | `https://www.linkedin.com/in/rafael-sanguini-b49ab33aa/` |
| 💬 WhatsApp | `+55 (11) 98236-0707` |
| 🐙 GitHub | `https://github.com/sanguinirafa76` |

---

*InvestX © 2025 · Motor OMEGA v3.2 · Powered by Groq · LLaMA 3.3 70B · Yahoo Finance*
