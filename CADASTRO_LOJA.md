# 🏪 Página de Cadastro de Loja

## ✅ O que foi criado

Criei uma **página completa de cadastro** para donos de loja cadastrarem seus negócios no Rappy!

### 📁 Arquivos Criados/Modificados:

1. ✅ `web-rango/src/pages/Register.tsx` - Página de cadastro completa
2. ✅ `web-rango/src/App.tsx` - Rota `/register` adicionada
3. ✅ `web-rango/src/pages/Login.tsx` - Link para cadastro adicionado

---

## 🎨 Funcionalidades da Página

### **4 Etapas de Cadastro:**

#### **1️⃣ Dados da Conta**
- Nome completo
- Email
- Telefone
- Senha (mínimo 6 caracteres)
- Confirmação de senha

#### **2️⃣ Dados da Loja**
- Nome da loja
- Descrição
- Categoria (Pizzaria, Hamburgueria, etc)
- Telefone da loja
- Email da loja
- Website (opcional)
- Tempo de entrega
- Taxa de entrega

#### **3️⃣ Endereço**
- Rua
- Número
- Bairro
- CEP
- Cidade
- Estado

#### **4️⃣ Horários de Funcionamento**
- Horário de abertura e fechamento para cada dia da semana
- Opção de marcar dias como fechado
- Configuração individual para cada dia

---

## 🚀 Como Usar

### **Acessar a Página:**

1. **Via URL direta:**
```
http://localhost:5173/register
```

2. **Via página de login:**
- Abrir `http://localhost:5173/login`
- Clicar em "Cadastre sua loja"

### **Preencher Formulário:**

1. **Etapa 1 - Conta:**
   - Preencha seus dados pessoais
   - Crie uma senha forte
   - Clique em "Próximo"

2. **Etapa 2 - Loja:**
   - Informações da sua loja
   - Dados de contato
   - Configurações de delivery
   - Clique em "Próximo"

3. **Etapa 3 - Endereço:**
   - Complete o endereço da loja
   - Clique em "Próximo"

4. **Etapa 4 - Horários:**
   - Configure os horários de funcionamento
   - Marque dias fechados se necessário
   - Clique em "Finalizar Cadastro"

### **Após o Cadastro:**

✅ O sistema irá:
1. Criar conta no Firebase Authentication
2. Criar documento do usuário no Firestore
3. Criar a loja no Firestore
4. Redirecionar para o dashboard

---

## 🎯 O que acontece no Backend

Quando o usuário clica em "Finalizar Cadastro":

```typescript
// 1. Criar usuário no Firebase Auth
const userCredential = await createUserWithEmailAndPassword(
  auth,
  email,
  password
);

// 2. Criar loja usando o serviço
const storeId = await createStore({
  name: 'Nome da Loja',
  description: 'Descrição',
  address: { /* ... */ },
  // ... outros dados
});

// 3. Criar documento do usuário
await setDoc(doc(db, 'users', user.uid), {
  email: email,
  role: 'dono_da_loja',
  storeId: storeId,
  storeName: 'Nome da Loja',
  // ... outros dados
});

// 4. Redirecionar para dashboard
navigate('/dashboard');
```

---

## 📊 Estrutura de Dados Criada

### **1. Firebase Auth:**
```typescript
{
  uid: "user123",
  email: "joao@exemplo.com",
  displayName: "João Silva"
}
```

### **2. Firestore - users/{uid}:**
```typescript
{
  email: "joao@exemplo.com",
  nome: "João Silva",
  role: "dono_da_loja",
  storeId: "store123",
  storeName: "Pizzaria do João",
  phone: "(11) 99999-9999",
  createdAt: Date,
  updatedAt: Date
}
```

### **3. Firestore - stores/{storeId}:**
```typescript
{
  name: "Pizzaria do João",
  description: "A melhor pizza da cidade",
  logo: "url-da-imagem",
  coverImage: "url-da-imagem",
  address: {
    street: "Rua das Flores",
    number: "123",
    neighborhood: "Centro",
    city: "São Paulo",
    state: "SP",
    zipCode: "01234-567"
  },
  contact: {
    phone: "(11) 3333-3333",
    email: "contato@pizzaria.com",
    website: "https://pizzaria.com"
  },
  delivery: {
    deliveryTime: "30-45 min",
    deliveryFee: 5.99,
    freeDeliveryMinValue: 30.00,
    deliveryRadius: 5
  },
  operatingHours: {
    monday: { open: "09:00", close: "18:00", isOpen: true },
    // ... outros dias
  },
  category: "Pizzaria",
  isActive: true,
  createdAt: Date,
  updatedAt: Date
}
```

---

## ✨ Validações Implementadas

### **Validação de Conta:**
- ✅ Todos os campos obrigatórios preenchidos
- ✅ Senhas coincidem
- ✅ Senha tem mínimo 6 caracteres
- ✅ Email válido

### **Validação de Loja:**
- ✅ Nome da loja preenchido
- ✅ Descrição preenchida

### **Validação de Endereço:**
- ✅ Rua, número, cidade e estado preenchidos

### **Tratamento de Erros:**
- ✅ Email já em uso
- ✅ Email inválido
- ✅ Senha fraca
- ✅ Erros de conexão

---

## 🎨 Design e UX

### **Características:**
- ✅ Design moderno e responsivo
- ✅ Navegação por abas (Tabs)
- ✅ Indicadores visuais de progresso
- ✅ Validação em tempo real
- ✅ Mensagens de erro claras
- ✅ Loading states
- ✅ Feedback visual (toasts)

### **Componentes ShadCN/UI Usados:**
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`
- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`
- `Button`, `Input`, `Label`, `Textarea`
- `useToast` para notificações

---

## 🔧 Personalização

### **Adicionar Campos Extras:**

```typescript
// Em Register.tsx, adicione no storeData:
const [storeData, setStoreData] = useState({
  // ... campos existentes
  instagram: '',
  facebook: '',
  minimumOrder: '15.00' // Pedido mínimo
});
```

### **Modificar Horários Padrão:**

```typescript
const [operatingHours, setOperatingHours] = useState({
  monday: { open: '11:00', close: '23:00', isOpen: true },
  // ... modificar conforme necessário
});
```

### **Adicionar Upload de Imagens:**

```typescript
// Integrar com Firebase Storage ou serviço de upload
const handleUploadLogo = async (file: File) => {
  // Upload da imagem
  const url = await uploadToStorage(file);
  setStoreData({ ...storeData, logo: url });
};
```

---

## 📱 Fluxo Completo

```
1. Usuário acessa /register
   ↓
2. Preenche dados da conta
   ↓
3. Preenche dados da loja
   ↓
4. Preenche endereço
   ↓
5. Configura horários
   ↓
6. Clica em "Finalizar Cadastro"
   ↓
7. Sistema cria:
   - Conta no Firebase Auth
   - Documento do usuário
   - Documento da loja
   ↓
8. Usuário é redirecionado para /dashboard
   ↓
9. Pode começar a gerenciar sua loja!
```

---

## 🧪 Como Testar

### **1. Iniciar o web-rango:**
```bash
cd web-rango
npm run dev
```

### **2. Acessar:**
```
http://localhost:5173/register
```

### **3. Preencher com dados de teste:**
- **Email:** teste@minhaloja.com
- **Senha:** 123456
- **Nome da Loja:** Minha Loja Teste
- Preencher demais campos

### **4. Verificar no Firebase:**
- Console do Firebase → Authentication
- Console do Firebase → Firestore → users
- Console do Firebase → Firestore → stores

---

## 🐛 Troubleshooting

### **Erro: "Email já em uso"**
- Solução: Usar outro email ou deletar usuário no Firebase Console

### **Erro: "Senha muito fraca"**
- Solução: Usar senha com pelo menos 6 caracteres

### **Erro ao criar loja**
- Verificar regras do Firestore
- Verificar console do navegador para logs
- Verificar conexão com Firebase

---

## 🚀 Próximos Passos Sugeridos

### **Melhorias Possíveis:**

1. **Upload de Imagens:**
   - [ ] Integrar Firebase Storage
   - [ ] Permitir upload de logo e capa
   - [ ] Crop de imagens

2. **Validação de CEP:**
   - [ ] Integrar API de CEP (ViaCEP)
   - [ ] Preencher endereço automaticamente

3. **Pré-visualização:**
   - [ ] Mostrar preview da loja
   - [ ] Ver como ficará no app mobile

4. **Documentação:**
   - [ ] Adicionar campo para documentos
   - [ ] CNPJ da empresa
   - [ ] Documentos do proprietário

5. **Email de Confirmação:**
   - [ ] Enviar email de boas-vindas
   - [ ] Verificação de email

---

## ✅ Checklist de Implementação

```
✅ Página de cadastro criada
✅ 4 etapas implementadas
✅ Validações funcionando
✅ Integração com Firebase Auth
✅ Integração com Firestore
✅ Serviço de stores utilizado
✅ Rota /register adicionada
✅ Link no login funcionando
✅ Redirecionamento para dashboard
✅ Tratamento de erros
✅ Loading states
✅ Toasts de feedback
✅ Design responsivo
```

---

## 🎉 Resultado

Agora você tem uma **página de cadastro completa e profissional** onde donos de loja podem:
- ✅ Criar conta facilmente
- ✅ Cadastrar sua loja
- ✅ Configurar todos os detalhes
- ✅ Começar a usar o sistema imediatamente

**Pronto para receber novos lojistas!** 🚀 