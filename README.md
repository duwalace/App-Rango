# 🍔 Rappy - Sistema de Delivery Completo

Sistema completo de delivery de comida no estilo iFood, com aplicativo mobile (React Native) e dashboard web (React + Vite) integrados em tempo real via Firebase.

## 📱 Projetos

### **App-Rango** (Mobile)
Aplicativo React Native com Expo para clientes e entregadores.

### **Web-Rango** (Dashboard)
Dashboard web para donos de loja gerenciarem seus negócios.

## ✨ Funcionalidades

### App Mobile (Cliente)
- ✅ Navegação por categorias de restaurantes
- ✅ Visualização de cardápios em tempo real
- ✅ Carrinho de compras
- ✅ Sistema de pedidos
- ✅ Acompanhamento de pedidos em tempo real
- ✅ Múltiplos métodos de pagamento

### Web Dashboard (Dono da Loja)
- ✅ Gerenciamento completo da loja
- ✅ Edição de cardápio (categorias e itens)
- ✅ Recebimento de pedidos em tempo real
- ✅ Atualização de status de pedidos
- ✅ Estatísticas e métricas de negócio
- ✅ Controle de disponibilidade de produtos

## 🔥 Comunicação em Tempo Real

O app e o web se comunicam em **tempo real** através do Firebase:
- Dono edita preço no dashboard → Cliente vê novo preço no app **instantaneamente**
- Cliente faz pedido no app → Dono recebe notificação no dashboard **em tempo real**
- Dono aceita pedido no dashboard → Cliente vê atualização no app **automaticamente**

## 📚 Documentação dos Serviços

- **[📦 Serviços Compartilhados - Guia Completo](SERVICOS_COMPARTILHADOS.md)** - Documentação detalhada de todos os serviços
- **[✅ Resumo da Implementação](RESUMO_SERVICOS.md)** - Resumo executivo do que foi implementado

## 🚀 Como executar

### App-Rango (Mobile)
```bash
cd app-rango
npm install
npm start
```

### Web-Rango (Dashboard)
```bash
cd web-rango
npm install
npm run dev
```

## 🏗️ Estrutura do Projeto

```
Rappy/
├── app-rango/          # Aplicativo mobile (React Native)
│   └── src/
│       ├── types/      # Tipos compartilhados
│       ├── services/   # Serviços Firebase
│       ├── contexts/   # Contextos React
│       ├── Cliente/    # Telas do cliente
│       └── Entregador/ # Telas do entregador
│
├── web-rango/          # Dashboard web (React + Vite)
│   └── src/
│       ├── types/      # Tipos compartilhados
│       ├── services/   # Serviços Firebase
│       ├── pages/      # Páginas do dashboard
│       └── components/ # Componentes reutilizáveis
│
└── Documentação/
    ├── SERVICOS_COMPARTILHADOS.md
    └── RESUMO_SERVICOS.md
```

## 🛠️ Tecnologias Utilizadas

### App Mobile
- React Native + Expo
- TypeScript
- Firebase (Auth + Firestore)
- React Navigation

### Web Dashboard
- React + Vite
- TypeScript
- Firebase (Auth + Firestore)
- TailwindCSS
- ShadCN/UI
- React Router

## 🔒 Segurança

- Firebase Authentication
- Firestore Security Rules
- Controle de acesso baseado em roles
- Validação de dados no frontend e backend
