# 🚛 Sistema de Gestão de Transporte e Logística

Sistema completo para gerenciamento de custos de transporte, rotas, veículos e simulações logísticas.

## 📋 Índice

- [Como Usar em 5 Minutos](#-como-usar-em-5-minutos)
- [Funcionalidades Principais](#-funcionalidades-principais)
- [Configuração Inicial](#-configuração-inicial)
- [Guia de Uso Detalhado](#-guia-de-uso-detalhado)
- [Desenvolvimento](#-desenvolvimento)

---

## ⚡ Como Usar em 5 Minutos

### 1️⃣ Primeiro Acesso

1. **Acesse o sistema**: [https://lovable.dev/projects/19b2610a-ac1b-40ed-b854-a89cc309e6ea](https://lovable.dev/projects/19b2610a-ac1b-40ed-b854-a89cc309e6ea)

2. **Crie sua conta**:
   - Clique em "Cadastrar"
   - Preencha: Nome completo, Email e Senha
   - Clique em "Cadastrar"
   - Você receberá a função padrão de **Aluno**

3. **Faça login**:
   - Entre com seu email e senha
   - Você será redirecionado para o dashboard

### 2️⃣ Popular com Dados de Exemplo

Para começar rapidamente com dados de teste:

1. **Acesse o Supabase SQL Editor**:
   - Vá para: [https://supabase.com/dashboard/project/dhrsfmwhlrbvpsorqeoz/sql/new](https://supabase.com/dashboard/project/dhrsfmwhlrbvpsorqeoz/sql/new)
   
2. **Execute o script de seed**:
   - Copie o conteúdo do arquivo `supabase/seed.sql`
   - Cole no SQL Editor
   - Clique em "RUN"
   - ✅ Pronto! Você terá 8 veículos, 10 rotas, 12 viagens e 3 simulações de exemplo

### 3️⃣ Começar a Usar

Agora você pode:

- ✅ **Ver veículos** em "Veículos"
- ✅ **Explorar rotas** em "Rotas"
- ✅ **Consultar viagens** em "Viagens"
- ✅ **Criar simulações** em "Simulador"
- ✅ **Exportar relatórios** (botão "Exportar CSV" em cada tela)

---

## 🎯 Funcionalidades Principais

### 📊 Para Todos os Usuários

- **Dashboard**: Visão geral com métricas principais
- **Veículos**: Cadastro e gestão de frota
- **Rotas**: Gerenciamento de rotas com distâncias
- **Viagens**: Planejamento e acompanhamento de viagens
- **Simulador**: Simulações de custos e cenários
- **Relatórios**: Exportação em CSV
- **Calculadora**: Cálculos rápidos de custos

### 👨‍💼 Para Docentes

- Todos os recursos de Aluno
- Criar, editar e excluir veículos e rotas
- Gerenciar viagens de todos os usuários
- Acesso completo a simulações

### 🔑 Para Administradores

- Todos os recursos de Docente
- **Gestão de Usuários**: Alterar funções (Admin/Docente/Aluno)
- **Configurações Globais**: Parâmetros do sistema
- Acesso total ao sistema

---

## 🚀 Configuração Inicial

### Pré-requisitos

- Node.js 18+ e npm instalados
- Conta no Supabase (já configurada)

### Instalação Local

```bash
# 1. Clone o repositório
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev

# 4. Acesse no navegador
# http://localhost:5173
```

---

## 📖 Guia de Uso Detalhado

### 🚗 Como Cadastrar um Veículo

1. Acesse **"Veículos"** no menu lateral
2. Clique em **"Novo Veículo"**
3. Preencha os dados:
   - **Tipo**: Ex: "Caminhão Toco", "Carreta", "Van"
   - **Capacidade (ton)**: Peso máximo que o veículo suporta
   - **Km por Litro**: Consumo médio do veículo
   - **Custo por Km**: Custo operacional por quilômetro
   - **Status**: "Disponível" ou "Em manutenção"
4. Clique em **"Salvar"**

💡 **Dica**: Use o botão "Importar CSV" para adicionar vários veículos de uma vez!

---

### 🗺️ Como Criar uma Rota

1. Acesse **"Rotas"** no menu
2. Clique em **"Nova Rota"**
3. Preencha:
   - **Origem**: Cidade de partida
   - **Destino**: Cidade de chegada
   - **Distância (km)**: Distância total
   - **Tempo Estimado (h)**: Tempo de viagem
4. Clique em **"Salvar"**

💡 **Dica**: Depois de criar rotas, você pode adicionar pedágios em "Parâmetros" > "Pedágios"

---

### 📦 Como Planejar uma Viagem

1. Acesse **"Viagens"** no menu
2. Clique em **"Nova Viagem"**
3. Selecione:
   - **Veículo**: Escolha da sua frota
   - **Rota**: Rota a ser percorrida
   - **Datas**: Data de início e fim
   - **Carga**: Peso e volume (opcional)
4. Preencha custos estimados:
   - Combustível, pedágios, variáveis
   - Receita esperada
5. Clique em **"Salvar"**

O sistema calculará automaticamente:
- ✅ Consumo de combustível
- ✅ Custo total estimado
- ✅ Tempo de viagem
- ✅ Margem de lucro

---

### 🎲 Como Criar uma Simulação

1. Acesse **"Simulador"** ou **"Viagens"**
2. Clique em **"Nova Simulação"**
3. Escolha uma **viagem base** (ou crie cenários do zero)
4. Ajuste os parâmetros:
   - **Preço do Diesel**: Simule variações de preço
   - **Ocupação**: Percentual de carga
   - **Entregas na Rota**: Número de paradas
   - **Custos Extras**: Pedágios, variáveis adicionais
5. Clique em **"Rodar Simulação"**

O sistema gerará:
- 📊 Custo total, por entrega, por tonelada/km
- 💰 Margem de lucro
- ⏱️ Tempo estimado
- 🔥 Comparação entre cenários

💡 **Dica**: Crie 3 cenários (otimista, realista, pessimista) para melhor planejamento!

---

### 💸 Como Calcular Custos Rapidamente

1. Acesse **"Calculadora"** no menu
2. Selecione:
   - Veículo
   - Rota
   - Número de entregas
3. Veja instantaneamente:
   - Custo total
   - Custo por entrega
   - Distância e tempo

---

### 📥 Como Exportar Relatórios

1. Em qualquer tela (Veículos, Rotas, Viagens, Simulações)
2. Clique no botão **"Exportar CSV"** (ícone de download)
3. O arquivo será baixado automaticamente
4. Abra no Excel, Google Sheets ou qualquer editor de planilhas

**Dados incluídos no CSV**:
- Veículos: tipo, capacidade, custos, status
- Rotas: origem, destino, distância, tempo
- Viagens: todos os custos, receitas, margens
- Simulações: cenários completos com comparações

---

### ⚙️ Como Configurar Parâmetros Globais

1. Acesse **"Parâmetros"** no menu
2. Configure:
   - **Preço do Diesel**: Valor atual por litro
   - **Velocidade Média**: Velocidade padrão da frota
   - **Moeda**: Símbolo monetário

3. **Custos Fixos** (Salários, IPVA, Seguros):
   - Clique em "Novo Custo Fixo"
   - Nome, valor mensal, ativo/inativo

4. **Custos Variáveis** (Manutenção, Pneus):
   - Clique em "Novo Custo Variável"
   - Nome, valor por km, ativo/inativo

5. **Pedágios**:
   - Associe pedágios a rotas específicas
   - Informe descrição e valor

---

### 👥 Como Gerenciar Usuários (Admin)

1. Acesse **"Usuários"** no menu (apenas Admin)
2. Veja todos os usuários cadastrados
3. Para alterar a função de um usuário:
   - Clique no menu (⋮) ao lado do usuário
   - Selecione "Editar Função"
   - Escolha: **Admin**, **Docente** ou **Aluno**
   - Salve

**Diferenças de Função**:
- **Aluno**: Visualiza veículos, rotas e cria simulações
- **Docente**: Aluno + cria/edita veículos, rotas e viagens
- **Admin**: Docente + gerencia usuários e configurações globais

---

## 🛠️ Desenvolvimento

### Tecnologias Utilizadas

- **Frontend**: React 18 + TypeScript
- **Build**: Vite
- **Estilização**: Tailwind CSS + shadcn-ui
- **Backend**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth
- **Roteamento**: React Router v6

### Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes shadcn-ui
│   ├── AppLayout.tsx   # Layout principal
│   └── ...
├── pages/              # Páginas do sistema
│   ├── Auth.tsx        # Login/Cadastro
│   ├── Index.tsx       # Dashboard
│   ├── Vehicles.tsx    # Gestão de veículos
│   ├── RoutesPage.tsx  # Gestão de rotas
│   └── ...
├── hooks/              # Hooks customizados
│   ├── useAuth.tsx     # Autenticação
│   └── useRole.tsx     # Controle de funções
├── integrations/       # Integrações
│   └── supabase/       # Cliente Supabase
└── lib/                # Utilitários
```

### Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview

# Lint
npm run lint
```

### Deploy

O projeto está configurado para deploy automático via Lovable:

1. Clique em **"Publish"** no canto superior direito
2. Seu app será publicado em: `https://[seu-projeto].lovable.app`

Para conectar um domínio customizado:
- Acesse: Project > Settings > Domains
- Leia mais: [Custom Domain Guide](https://docs.lovable.dev/tips-tricks/custom-domain)

---

## 🔐 Segurança

- ✅ **Row Level Security (RLS)** ativo em todas as tabelas
- ✅ Usuários só veem seus próprios dados (exceto Docentes/Admins)
- ✅ Funções gerenciadas via tabela `user_roles` separada
- ✅ Políticas de acesso baseadas em funções

---

## 📚 Recursos Adicionais

- **Documentação Lovable**: [docs.lovable.dev](https://docs.lovable.dev/)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Shadcn-ui**: [ui.shadcn.com](https://ui.shadcn.com/)

---

## 💡 Dicas e Truques

1. **Use o seed.sql**: Sempre comece com dados de exemplo para testar
2. **Exporte relatórios**: Use CSV para análises no Excel
3. **Crie simulações**: Compare cenários antes de executar viagens reais
4. **Configure custos fixos/variáveis**: Deixe o sistema calcular automaticamente
5. **Pedágios por rota**: Associe pedágios às rotas para cálculos precisos

---

## 🐛 Suporte

Problemas? Dúvidas?
- 📧 Entre em contato através do projeto Lovable
- 💬 Discord Lovable: [discord.gg/lovable](https://discord.com/channels/1119885301872070706/1280461670979993613)

---

## 📄 Licença

Este projeto foi criado com [Lovable](https://lovable.dev)

**URL do Projeto**: https://lovable.dev/projects/19b2610a-ac1b-40ed-b854-a89cc309e6ea
