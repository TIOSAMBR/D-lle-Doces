# 🍰 Délle Doces — Gestão Financeira

Sistema web de **gestão financeira para a Délle Doces**, desenvolvido para facilitar o controle de vendas, produtos, despesas, faturamento, custos e lucro em um único lugar.

O projeto foi desenvolvido com **HTML, CSS e JavaScript**, utilizando **Firebase Authentication e Cloud Firestore** para autenticação, armazenamento em nuvem e sincronização dos dados em tempo real. A aplicação também possui estrutura **PWA**, permitindo sua instalação em dispositivos móveis, como um aplicativo.

---

## 📸 Sobre o projeto

A **Délle Doces — Gestão Financeira** foi criada para transformar o controle financeiro da loja em um processo simples, organizado e acessível.

A aplicação permite registrar as movimentações financeiras e acompanhar os principais indicadores do negócio, evitando a necessidade de controles manuais espalhados em diferentes arquivos ou aplicativos.

### Principais recursos

- 🍰 Gerenciamento de produtos
- 🛒 Registro de vendas
- 💸 Controle de despesas
- 📊 Acompanhamento financeiro
- 💰 Controle de faturamento
- 📉 Controle de custos
- 📈 Acompanhamento de lucro
- 📅 Organização dos dados por período
- 🔐 Login com e-mail e senha
- ☁️ Armazenamento dos dados no Firebase
- 🔄 Sincronização em tempo real entre dispositivos
- 👥 Dados separados por usuário
- 💾 Funcionamento com armazenamento local
- 📱 Aplicação instalável como PWA
- 📲 Interface responsiva para computador e celular
- 🌐 Compatível com publicação no GitHub Pages

---

## 🧁 Funcionalidades

### 🛍️ Produtos

Permite cadastrar e gerenciar os produtos comercializados pela Délle Doces.

É possível manter informações importantes para o controle financeiro e utilizar os produtos cadastrados durante o registro das vendas.

### 🛒 Vendas

O sistema permite registrar as vendas realizadas pela loja e acompanhar os valores movimentados.

Os registros podem ser utilizados para gerar uma visão consolidada do desempenho financeiro.

### 💸 Despesas

Possibilita registrar os gastos da empresa e acompanhar as despesas realizadas durante cada período.

Isso facilita a comparação entre:

**Faturamento → Custos/Despesas → Resultado**

### 📊 Gestão financeira

A aplicação reúne os dados financeiros em uma interface única, permitindo acompanhar os principais resultados da loja.

A estrutura foi pensada para facilitar a análise do negócio sem deixar o usuário dependente de planilhas externas.

---

# ☁️ Firebase

O projeto utiliza o Firebase para adicionar recursos de nuvem ao sistema.

### 🔐 Firebase Authentication

O sistema utiliza autenticação por e-mail e senha.

Cada usuário possui uma conta própria e um **UID exclusivo**.

Isso permite separar os dados de diferentes usuários.

Exemplo:

```text
☁️ Firebase
│
├── 👤 Usuário 1
│   ├── Produtos
│   ├── Vendas
│   └── Despesas
│
├── 👤 Usuário 2
│   ├── Produtos
│   ├── Vendas
│   └── Despesas
│
└── 👤 Usuário 3
    ├── Produtos
    ├── Vendas
    └── Despesas
```

Cada conta trabalha com seu próprio conjunto de dados.

---

## 🔄 Sincronização em tempo real

O projeto possui integração com o **Cloud Firestore**.

Isso permite que uma alteração feita em um dispositivo seja refletida automaticamente nos outros dispositivos conectados à mesma conta.

Exemplo:

```text
📱 Celular
   ↓
📝 Nova venda
   ↓
☁️ Firestore
   ↓
💻 Computador
   ↓
🔄 Atualização automática
```

Não é necessário atualizar manualmente a página para receber alterações sincronizadas.

---

# 🔒 Segurança

O projeto utiliza regras do Firestore para restringir o acesso aos dados.

A ideia principal é:

```text
Usuário autenticado
        ↓
UID do usuário
        ↓
Somente seus próprios dados
```

As regras devem impedir que um usuário autenticado consiga acessar os documentos pertencentes a outro usuário.

> ⚠️ **Importante:** as regras do Firestore devem permanecer publicadas e revisadas antes de colocar o sistema em produção.

---

# 💾 Armazenamento local

Além do Firebase, o projeto possui suporte a armazenamento local no navegador.

Isso ajuda a manter os dados disponíveis localmente e permite que a aplicação continue funcionando em situações de conexão instável.

Quando a aplicação estiver conectada ao Firebase, os dados podem ser sincronizados com a nuvem conforme a lógica implementada no projeto.

---

# 📱 PWA — Progressive Web App

A Délle Doces também possui estrutura de **Progressive Web App (PWA)**.

Isso permite instalar a aplicação em dispositivos compatíveis e utilizá-la com uma experiência semelhante à de um aplicativo.

### No iPhone

O usuário pode acessar o sistema pelo Safari e utilizar:

**Compartilhar → Adicionar à Tela de Início**

Depois disso, o sistema poderá ser aberto diretamente pelo ícone instalado.

### Recursos PWA

- 📱 Manifest
- 🎨 Ícones do aplicativo
- ⚡ Service Worker
- 📲 Instalação na Tela de Início
- 💻 Compatibilidade com desktop e dispositivos móveis

---

# 🎨 Interface

A interface foi desenvolvida com foco em:

- 🍰 Identidade visual da Délle Doces
- 📱 Responsividade
- 🖥️ Uso em computadores
- 📲 Uso em celulares
- 🎯 Navegação simples
- ✨ Visual moderno
- 🧾 Organização das informações financeiras

---

# 🛠️ Tecnologias utilizadas

| Tecnologia | Utilização |
|---|---|
| HTML5 | Estrutura da aplicação |
| CSS3 | Interface e responsividade |
| JavaScript | Lógica e funcionalidades |
| Firebase Authentication | Autenticação dos usuários |
| Cloud Firestore | Banco de dados em nuvem |
| LocalStorage | Persistência local |
| PWA | Instalação como aplicativo |
| Service Worker | Recursos offline e cache |
| GitHub Pages | Hospedagem |

---

# 📁 Estrutura do projeto

```text
D-lle-Doces/
│
├── index.html
├── style.css
├── script.js
│
├── firebase-config.js
├── firebase-sync.js
├── firestore.rules
│
├── manifest.json
├── service-worker.js
│
├── README.md
├── README-FIREBASE.md
│
├── logo-referencia.png
│
└── icons/
    ├── icon-180.png
    ├── icon-192.png
    └── icon-512.png
```

### Principais arquivos

**`index.html`**

Estrutura principal da aplicação.

**`style.css`**

Responsável pelo design, layout, responsividade e identidade visual.

**`script.js`**

Contém a lógica principal da aplicação e gerenciamento das funcionalidades.

**`firebase-config.js`**

Configuração do projeto Firebase utilizado pela aplicação.

> 🔐 Não coloque informações privadas ou credenciais administrativas nesse arquivo.

**`firebase-sync.js`**

Responsável pela integração e sincronização dos dados com o Firebase.

**`firestore.rules`**

Contém as regras de segurança utilizadas pelo Cloud Firestore.

**`manifest.json`**

Configura a aplicação como PWA.

**`service-worker.js`**

Responsável pelos recursos de cache e comportamento offline da aplicação.

---

# 🔥 Configuração do Firebase

Para utilizar o projeto com seu próprio Firebase:

### 1. Criar um projeto

Acesse o Firebase Console e crie um novo projeto.

### 2. Ativar Authentication

Ative:

```text
Authentication
→ Sign-in method
→ E-mail/Senha
```

### 3. Criar o Firestore

Crie um banco de dados no:

```text
Firestore Database
```

### 4. Registrar o aplicativo Web

Adicione um aplicativo Web ao projeto Firebase e copie a configuração fornecida.

### 5. Configurar o projeto

Coloque a configuração correspondente no:

```text
firebase-config.js
```

### 6. Publicar as regras

Utilize o arquivo:

```text
firestore.rules
```

e publique as regras no Firestore.

---

# 🌐 Publicação

O projeto pode ser hospedado gratuitamente utilizando o **GitHub Pages**.

Fluxo básico:

```text
Código
  ↓
GitHub
  ↓
GitHub Pages
  ↓
🌐 Aplicação online
  ↓
📱 Instalação como PWA
```

---

# 📱 Compatibilidade

O projeto foi desenvolvido pensando em diferentes dispositivos.

### 💻 Desktop

- Google Chrome
- Microsoft Edge
- Mozilla Firefox
- Safari

### 📱 Mobile

- iPhone / iOS
- Android

A disponibilidade de determinados recursos de instalação PWA pode variar conforme o navegador e o sistema operacional.

---

# 🔄 Arquitetura simplificada

```text
                  ┌─────────────────┐
                  │   Délle Doces   │
                  │   Web App/PWA   │
                  └────────┬────────┘
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
       💾 Armazenamento           🔐 Firebase Auth
          local                         │
                                        ▼
                                🆔 Usuário / UID
                                        │
                                        ▼
                                ☁️ Cloud Firestore
                                        │
                              🔄 Tempo real
                                        │
                         ┌──────────────┴──────────────┐
                         ▼                             ▼
                    📱 Celular                    💻 Computador
```

---

# 🚀 Possíveis melhorias futuras

Algumas funcionalidades que podem ser adicionadas futuramente:

- 📊 Gráficos financeiros
- 📅 Relatórios mensais
- 📄 Exportação para PDF
- 📊 Exportação para Excel
- 🧾 Impressão de relatórios
- 📦 Controle de estoque
- 🔔 Notificações
- 👥 Gerenciamento de usuários
- 🧑‍💼 Diferentes níveis de acesso
- 📈 Dashboard mais avançado
- 💳 Controle de formas de pagamento
- 🧾 Histórico detalhado de alterações
- ☁️ Backup e restauração
- 📱 Melhorias específicas para iOS e Android

---

# 🎯 Objetivo do projeto

O objetivo principal da **Délle Doces — Gestão Financeira** é fornecer uma ferramenta simples, moderna e acessível para auxiliar no gerenciamento financeiro de uma pequena empresa de confeitaria.

A aplicação centraliza as principais informações do negócio em um único sistema, facilitando o acompanhamento das vendas, despesas, custos e resultados.

---

# 👨‍💻 Desenvolvimento

Projeto desenvolvido por **Samuel Toledo** como aplicação prática de desenvolvimento web, integração com serviços em nuvem e construção de Progressive Web Apps.

### Tecnologias e conhecimentos aplicados

- Desenvolvimento Front-End
- HTML5
- CSS3
- JavaScript
- Responsividade
- LocalStorage
- Firebase Authentication
- Cloud Firestore
- Sincronização em tempo real
- PWA
- Service Worker
- Git/GitHub
- GitHub Pages

---

# 📌 Status

🟢 **Projeto em desenvolvimento contínuo**

Novas funcionalidades e melhorias podem ser adicionadas conforme as necessidades da Délle Doces.

---

## 🍰 Délle Doces

**Gestão financeira simples, organizada e conectada.**

---

⭐ Se este projeto foi útil ou interessante para você, considere deixar uma estrela no repositório!
