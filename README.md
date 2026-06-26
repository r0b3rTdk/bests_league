# 🏆 Bests League — Dashboard de Gestão de Peladas

A **Bests League** é uma plataforma web **SPA (Single Page Application)** de alta performance desenvolvida para gerenciar estatísticas, elencos, calendários, artilharia e cartões de uma liga de futebol amador.

O projeto adota uma identidade visual pesada e minimalista inspirada na estética **trap/streetwear**, utilizando uma paleta **total blackout**, tipografia robusta e detalhes em **dourado neon**, proporcionando uma experiência moderna e responsiva.

---

# ⚡ Principais Funcionalidades

## 🔊 Loading Screen Trap Style

Tela de carregamento imersiva com animação **Bass Pulse**, simulando a batida de um subgrave 808, além de inicialização através da interação do usuário com o botão **"Entrar na Banca"**, respeitando as políticas modernas de reprodução de áudio dos navegadores.

---

## 🔄 Sincronização Reativa

Integração em tempo real com o **Firebase Realtime Database**.

Toda alteração realizada em:

* Jogos
* Elencos
* Cartões
* Estatísticas
* Classificação

é sincronizada automaticamente com a nuvem e refletida instantaneamente para todos os usuários conectados, sem necessidade de atualizar a página.

---

## 🛡️ Painel Administrativo Oculto

Sistema administrativo protegido por autenticação local.

O acesso é realizado através de:

* Clique secreto no rodapé
* Solicitação de senha
* Geração de token local

Garantindo que apenas administradores possam editar os dados da liga.

---

## 📅 Gestão Inteligente de Temporadas

O sistema identifica automaticamente a temporada em andamento e abre diretamente nela.

Temporadas anteriores permanecem arquivadas para consulta, sem interferir nos dados atuais.

---

## 📱 Layout 100% Responsivo

Interface adaptada para:

* Desktop
* Tablets
* Smartphones

Ideal para atualização rápida das partidas diretamente na beira do campo.

---

# 📁 Estrutura do Projeto

```text
├── css/
│   ├── variables.css      # Variáveis globais e paleta de cores
│   ├── layout.css         # Estrutura geral da aplicação
│   ├── components.css     # Botões, inputs e componentes reutilizáveis
│   ├── modal.css          # Estilos dos modais
│   └── player-cards.css   # Cards dos jogadores
│
├── js/
│   ├── firebase-init.js   # Inicialização do Firebase
│   ├── data.js            # Modelos e dados iniciais
│   ├── state.js           # Estado global da aplicação
│   ├── calc.js            # Algoritmos de classificação e estatísticas
│   │
│   ├── render/
│   │   ├── helpers.js
│   │   ├── header-hero.js
│   │   ├── abas.js
│   │   ├── jogadores-cards.js
│   │   └── geral.js
│   │
│   ├── modals/
│   │   ├── shared.js
│   │   ├── jogo.js
│   │   ├── elenco.js
│   │   └── temporada.js
│   │
│   └── app.js             # Bootstrap da aplicação
│
├── index.html
└── README.md
```

---

# 🛠️ Tecnologias Utilizadas

* HTML5
* CSS3

  * Variáveis CSS
  * Flexbox
  * Keyframes
* JavaScript ES6+
* Firebase Realtime Database
* LocalStorage API

---

# 🚀 Executando Localmente

## 1. Clone o repositório

```bash
git clone https://github.com/SEU_USUARIO/bests-league.git

cd bests-league
```

---

## 2. Configure o Firebase

Crie um projeto no **Firebase Console**.

Ative o **Realtime Database**.

Durante os testes utilize as seguintes regras:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

Depois disso, substitua as credenciais dentro de:

```text
js/firebase-init.js
```

---

## 3. Execute o projeto

Como a aplicação foi construída utilizando apenas JavaScript Vanilla, basta:

* abrir o arquivo `index.html`

ou

* utilizar a extensão **Live Server** do VS Code.

---

# 📦 Deploy

O projeto pode ser publicado facilmente utilizando **GitHub Pages**.

Sempre que houver alterações:

```bash
git add .

git commit -m "feat: melhorias na dashboard"

git push origin main
```

---

# 🎯 Objetivo

A Bests League foi criada para oferecer uma forma rápida, intuitiva e centralizada de organizar campeonatos de futebol amador, mantendo estatísticas, histórico das partidas e gerenciamento de jogadores em tempo real.

---

# 💻 Autor

**Robert Emanuel** *(r0b3rT)*

Desenvolvido com foco em **performance**, **arquitetura modular**, **experiência do usuário** e, claro, muita **resenha esportiva**. ⚽🔥
