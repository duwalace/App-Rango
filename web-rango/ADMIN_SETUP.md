# 🔐 Setup do Super Admin (Dono do Site)

## 📋 Visão Geral

O sistema agora suporta um **Super Admin** (role: `dono_do_site`) que tem acesso a um dashboard completamente diferente para gerenciar toda a plataforma Rappy.

## 🎯 Funcionalidades do Admin

### ✅ Já Implementadas:

#### 1. **Dashboard Principal**
- KPIs em tempo real (Lojas, Clientes, Entregadores, Pedidos)
- Métricas financeiras (GMV, Receita da Plataforma)
- Visão geral de toda a plataforma

#### 2. **Gestão de Lojas**
- Lista completa de todas as lojas
- Aprovação de novos cadastros
- Suspender/Ativar lojas
- Filtros e busca avançada
- Ações administrativas

#### 3. **Gestão de Usuários**
- Gerenciar clientes
- Gerenciar entregadores
- (Estrutura básica criada)

#### 4. **Financeiro Global**
- Relatórios de receita
- Gestão de repasses
- (Estrutura básica criada)

#### 5. **Configurações da Plataforma**
- Gestão de categorias
- Cupons globais
- Taxas e comissões
- Termos de serviço
- (Estrutura básica criada)

#### 6. **Operações e Suporte**
- Central de suporte
- Moderação de conteúdo
- Notificações em massa
- (Estrutura básica criada)

---

## 🚀 Como Criar um Usuário Admin

### **Opção 1: Via Firebase Console (RECOMENDADO)**

1. **Criar usuário no Authentication:**
   - Acesse: https://console.firebase.google.com/project/apprango-81562/authentication/users
   - Clique em "Adicionar Usuário"
   - Email: `admin@rappy.com` (ou outro email)
   - Senha: `[senha forte]`
   - Clique em "Adicionar usuário"
   - **COPIE O UID** do usuário criado

2. **Criar documento no Firestore:**
   - Acesse: https://console.firebase.google.com/project/apprango-81562/firestore/data
   - Vá para a coleção `users`
   - Clique em "Adicionar documento"
   - **ID do documento:** Cole o UID que você copiou
   - Adicione os campos:
     ```
     uid: [UID do usuário] (string)
     email: admin@rappy.com (string)
     nome: Super Admin (string)
     role: dono_do_site (string)
     createdAt: [timestamp atual] (timestamp)
     updatedAt: [timestamp atual] (timestamp)
     ```
   - Clique em "Salvar"

3. **Fazer Login:**
   - Acesse: http://localhost:5173/login
   - Use o email e senha criados
   - Você será redirecionado para `/admin`

---

### **Opção 2: Via Script (Programático)**

1. **Usando a função createAdminUser:**

```typescript
import { createAdminUser } from '@/utils/createAdminUser';

// Chame esta função no console do navegador ou em um componente
createAdminUser('admin@rappy.com', 'SenhaForte123!', 'Super Admin');
```

2. **Via página /seed:**
   - Vá para: http://localhost:5173/seed
   - Abra o console do navegador (F12)
   - Execute:
     ```javascript
     import('/src/utils/createAdminUser.ts').then(({ createAdminUser }) => {
       createAdminUser('admin@rappy.com', 'SenhaForte123!', 'Super Admin');
     });
     ```

---

## 📊 Estrutura do Sistema

### **Roles de Usuários:**

| Role | Acesso | Rota |
|------|--------|------|
| `dono_do_site` | Admin Dashboard | `/admin` |
| `dono_da_loja` / `store_owner` | Store Dashboard | `/dashboard` |
| `cliente` | App Mobile | - |
| `entregador` | App Mobile | - |

### **Arquivos Criados:**

```
web-rango/src/
├── pages/
│   ├── AdminDashboard.tsx          # Layout principal do admin
│   └── admin/
│       ├── AdminOverview.tsx       # Dashboard com KPIs
│       ├── StoresManagement.tsx    # Gestão de lojas
│       ├── UsersManagement.tsx     # Gestão de usuários
│       ├── FinancialManagement.tsx # Financeiro global
│       ├── PlatformSettings.tsx    # Configurações
│       └── OperationsSupport.tsx   # Suporte
├── components/
│   └── AdminSidebar.tsx            # Sidebar do admin
├── utils/
│   └── createAdminUser.ts          # Script para criar admin
└── types/
    └── shared.ts                   # Tipos atualizados
```

---

## 🔐 Segurança

### **Regras de Firestore (a serem implementadas):**

```javascript
// firestore.rules
match /users/{userId} {
  // Apenas admins podem ver todos os usuários
  allow read: if request.auth.uid != null && 
                 get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'dono_do_site';
}

match /stores/{storeId} {
  // Admins podem ver e editar todas as lojas
  allow read, write: if request.auth.uid != null && 
                        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'dono_do_site';
}
```

---

## 🎨 Customização

### **Adicionar Novos Módulos:**

1. Crie um novo arquivo em `pages/admin/NomeDoModulo.tsx`
2. Adicione a rota em `AdminDashboard.tsx`:
   ```typescript
   <Route path="nome-do-modulo" element={<NomeDoModulo />} />
   ```
3. Adicione o item no menu em `AdminSidebar.tsx`:
   ```typescript
   {
     title: "Nome do Módulo",
     icon: IconName,
     href: "/admin/nome-do-modulo",
   }
   ```

---

## 📝 Próximos Passos (Opcional)

### **Para Expandir as Funcionalidades:**

1. **Módulo de Usuários:**
   - Implementar tabela de clientes com filtros
   - Implementar tabela de entregadores
   - Ações: banir, suspender, adicionar créditos

2. **Módulo Financeiro:**
   - Gráficos de receita
   - Relatórios detalhados por loja
   - Sistema de repasses automático

3. **Módulo de Configurações:**
   - CRUD completo de categorias
   - Sistema de cupons globais
   - Editor de taxas dinâmicas

4. **Módulo de Suporte:**
   - Sistema de tickets
   - Chat ao vivo
   - Base de conhecimento

---

## 🆘 Troubleshooting

### **Erro: "Usuário não tem permissão"**
- Verifique se o campo `role` no Firestore está como `'dono_do_site'`
- Limpe o cache e faça logout/login novamente

### **Não aparece o dashboard do admin:**
- Verifique se está acessando `/admin` e não `/dashboard`
- Verifique se o AuthContext está reconhecendo o role

### **Erro 403 ao carregar dados:**
- Configure as regras do Firestore para permitir acesso do admin
- Adicione as regras de segurança acima no `firestore.rules`

---

## 📞 Suporte

Para dúvidas ou problemas, verifique:
- Logs do console do navegador (F12)
- Logs do Firebase no console
- Status do usuário no Firestore

---

**Data de Criação:** 2025-01-03  
**Última Atualização:** 2025-01-03  
**Versão:** 1.0.0

