# 🏆 Bests League

> **Dashboard moderno para gerenciamento de peladas e ligas de futebol amador.**

A **Bests League** é uma **Single Page Application (SPA)** desenvolvida em **JavaScript Vanilla**, criada para administrar temporadas, partidas, estatísticas, elencos, artilharia e cartões de uma liga de futebol amador.

O projeto foi desenvolvido com foco em **performance**, **arquitetura modular**, **experiência do usuário** e **sincronização em tempo real**, utilizando o **Firebase Realtime Database** como backend.

---

## ✨ Preview

> *(Adicione aqui um GIF ou screenshots da aplicação.)*

```
📸 assets/preview.png
```

---

# 🚀 Funcionalidades

## 🔊 Loading Screen Trap Style

Tela de carregamento personalizada inspirada na estética trap, com animação **Bass Pulse**, simulando a batida de um subgrave **808**.

O áudio é iniciado apenas após o clique em **"Entrar na Banca"**, respeitando as políticas modernas de reprodução automática dos navegadores.

---

## 📊 Hero Dinâmico da Temporada

Ao arquivar uma temporada, o Hero principal é transformado automaticamente em um banner premium com a identidade visual do time campeão.

São exibidas informações como:

* 🏆 Time Campeão
* 📈 Aproveitamento
* ✅ Vitórias
* 🤝 Empates
* ❌ Derrotas
* ⚽ Gols Pró
* 🥅 Gols Contra

---

## 👥 Aba "Lendas da Pelada"

Sistema responsável por reconstruir automaticamente a carreira completa dos jogadores.

### Recursos

* Histórico de todas as temporadas
* Soma das estatísticas da carreira
* Agrupamento inteligente por nome
* Ignora diferenças entre maiúsculas/minúsculas
* Remove espaços extras automaticamente
* Desconsidera temporadas fantasmas ou rascunhos sem jogos válidos

---

## ⚽ Gestão Completa da Liga

A plataforma permite administrar:

* Temporadas
* Jogos
* Elencos
* Jogadores
* Artilharia
* Cartões
* Classificação
* Campeões

Tudo dentro de uma única SPA.

---

## 🔄 Sincronização em Tempo Real

Utilizando o **Firebase Realtime Database**, qualquer alteração realizada é sincronizada instantaneamente entre todos os usuários conectados.

Não é necessário atualizar a página.

---

## 🛡️ Painel Administrativo

O sistema possui um painel administrativo oculto.

O acesso ocorre através de:

1. Clique secreto no rodapé;
2. Autenticação por senha local;
3. Liberação das funções administrativas.

Após autenticado é possível:

* Criar temporadas
* Editar partidas
* Gerenciar elencos
* Atualizar estatísticas

---

# 🧠 Arquitetura

A aplicação foi construída utilizando arquitetura modular em JavaScript ES Modules.

```
📦 bests-league
│
├── css/
│   ├── variables.css
│   ├── layout.css
│   ├── components.css
│   ├── modal.css
│   └── player-cards.css
│
├── js/
│   ├── firebase-init.js
│   ├── data.js
│   ├── state.js
│   ├── calc.js
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
│   └── app.js
│
├── index.html
└── README.md
```

---

# 🛠️ Tecnologias

### Front-end

* HTML5
* CSS3
* JavaScript ES6+

### Estilização

* CSS Variables
* Flexbox
* CSS Grid
* Keyframes Animations

### Persistência

* Firebase Realtime Database
* LocalStorage

---

# ⚙️ Executando o projeto

## 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/bests-league.git

cd bests-league
```

---

## 2. Configure o Firebase

Crie um projeto no Firebase.

Ative o **Realtime Database**.

Durante o desenvolvimento utilize as seguintes regras:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

Depois insira as credenciais em:

```
js/firebase-init.js
```

---

## 3. Execute um servidor local

Como o projeto utiliza **ES Modules**, ele precisa ser servido através de um servidor HTTP.

### Live Server

Basta abrir o projeto no VS Code e iniciar o **Live Server**.

ou

### Python

```bash
python -m http.server 8000
```

Depois acesse:

```
http://localhost:8000
```

---

# 💡 Destaques Técnicos

* Arquitetura modular
* JavaScript Vanilla
* SPA sem frameworks
* Firebase Realtime Database
* Atualização em tempo real
* Componentização por módulos
* Renderização dinâmica
* Algoritmos de estatísticas
* Organização escalável
* Interface responsiva
* Identidade visual inspirada na cultura trap/streetwear

---

# 📈 Próximas funcionalidades

* [ ] Ranking histórico completo
* [ ] Exportação de estatísticas
* [ ] Sistema de usuários
* [ ] Login com Firebase Authentication
* [ ] Dashboard administrativo online
* [ ] Tema claro
* [ ] PWA
* [ ] Exportação para PDF
* [ ] Compartilhamento de partidas

---

# 👨‍💻 Autor

**Robert Emanuel** *(r0b3rT)*

Backend Developer • Data Analytics • Cybersecurity

Desenvolvido com foco em:

* Código limpo
* Performance
* Arquitetura escalável
* UX moderna
* Organização modular

---

## ⭐ Gostou do projeto?

Se este projeto foi útil ou serviu de inspiração, considere deixar uma **⭐ no repositório**.
