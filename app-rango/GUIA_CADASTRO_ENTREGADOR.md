# Guia de Cadastro de Entregador - App Rango

## 📋 Visão Geral

O sistema de cadastro de entregador foi implementado com integração completa ao Firebase, validações em tempo real e máscaras nos campos de entrada.

## 🎯 Funcionalidades Implementadas

### 1. Tela de Login do Entregador (`DeliveryLoginScreen`)
- ✅ Autenticação via Firebase Auth
- ✅ Validação de status do entregador (pending, approved, rejected, suspended)
- ✅ Mensagens personalizadas para cada estado
- ✅ Redirecionamento automático para dashboard após login

### 2. Tela de Cadastro (`DeliverySignupScreen`)
- ✅ Formulário em 5 etapas:
  1. **Dados Pessoais**: Nome, CPF, Telefone
  2. **Endereço**: CEP, Rua, Número, Complemento, Bairro, Cidade, UF
  3. **Documentos**: CNH (número, categoria, validade), RG
  4. **Veículo**: Tipo (bicicleta, moto, carro), Placa, Marca, Modelo
  5. **Dados Bancários**: Banco, Tipo de conta, Agência, Conta

### 3. Validações e Máscaras (`validators.ts`)
- ✅ **CPF**: Validação completa com dígitos verificadores + Máscara (000.000.000-00)
- ✅ **Telefone**: Validação + Máscara ((00) 00000-0000)
- ✅ **CEP**: Validação + Máscara (00000-000)
- ✅ **CNH**: Validação de 11 dígitos
- ✅ **Data**: Validação + Máscara (DD/MM/AAAA)
- ✅ **Placa**: Formatação automática (ABC-1234)
- ✅ **RG**: Máscara (00.000.000-0)

### 4. Backend (Firebase)
- ✅ Criação de perfil de entregador em `deliveryPersons` collection
- ✅ Status inicial: `pending` (aguardando aprovação)
- ✅ Estrutura completa com todos os campos necessários
- ✅ Timestamps automáticos (createdAt, updatedAt)

## 🔄 Fluxo de Cadastro

```
1. Usuário acessa "Seja entregador" na tela principal
2. Escolhe "Quero ser entregador"
3. Preenche os 5 passos do formulário
4. Sistema valida cada campo em tempo real
5. Ao finalizar, dados são enviados para Firebase
6. Cadastro fica com status "pending"
7. Entregador recebe mensagem de confirmação
8. Admin aprova/rejeita o cadastro pelo painel web
9. Após aprovação, entregador pode fazer login
10. Dashboard do entregador é carregado
```

## 🚀 Como Usar

### Para o Entregador:

1. **Fazer Cadastro**:
   ```
   App > Perfil > Seja entregador > Quero ser entregador
   ```

2. **Fazer Login** (após aprovação):
   ```
   App > Perfil > Seja entregador > Já sou entregador
   ```

### Para o Admin (Web):

1. Acessar painel de gerenciamento de entregadores
2. Ver lista de cadastros pendentes
3. Aprovar ou rejeitar cadastros
4. Gerenciar entregadores ativos

## 📝 Campos Obrigatórios

### Etapa 1 - Dados Pessoais
- [x] Nome completo
- [x] CPF (validado)
- [x] Telefone (validado)

### Etapa 2 - Endereço
- [x] CEP (validado)
- [x] Rua
- [x] Número
- [x] Bairro
- [x] Cidade
- [x] UF (2 letras)
- [ ] Complemento (opcional)

### Etapa 3 - Documentos
- [x] Número da CNH (11 dígitos)
- [x] Categoria da CNH (A, B, AB, etc)
- [x] Número do RG
- [ ] Validade da CNH (opcional)

### Etapa 4 - Veículo
- [x] Tipo de veículo
- [x] Placa (se não for bicicleta)
- [ ] Marca (opcional)
- [ ] Modelo (opcional)

### Etapa 5 - Dados Bancários
- [ ] Todos os campos são opcionais
- Pode ser preenchido depois pelo entregador

## 🔐 Segurança

- ✅ Validação de CPF com algoritmo oficial
- ✅ Dados bancários criptografados no Firebase
- ✅ Autenticação via Firebase Auth
- ✅ Validação de status antes de permitir login
- ✅ Limpeza de dados (remoção de formatação) antes de salvar

## 📊 Status do Entregador

- **pending**: Aguardando aprovação (padrão)
- **approved**: Aprovado, pode fazer login
- **rejected**: Rejeitado, não pode fazer login
- **suspended**: Suspenso, acesso bloqueado

## 🛠️ Arquivos Criados/Modificados

### Novos Arquivos:
1. `app-rango/src/Entregador/DeliveryLoginScreen.tsx`
2. `app-rango/src/utils/validators.ts`

### Arquivos Modificados:
1. `app-rango/src/Entregador/DeliverySignupScreen.tsx`
   - Adicionadas validações em tempo real
   - Adicionadas máscaras nos campos
   - Melhorada a lógica de submissão

2. `app-rango/App.tsx`
   - Já estava configurado com todas as rotas necessárias

3. `app-rango/src/services/deliveryService.ts`
   - Já estava funcional e completo

## ✅ Checklist de Teste

- [x] Cadastro com dados válidos funciona
- [x] Validação de CPF inválido bloqueia avanço
- [x] Validação de telefone inválido bloqueia avanço
- [x] Máscaras são aplicadas corretamente
- [x] Login com entregador pendente mostra mensagem adequada
- [x] Login com entregador aprovado redireciona para dashboard
- [x] Login com entregador rejeitado mostra motivo
- [x] Dados são salvos corretamente no Firebase

## 📱 Próximos Passos (Opcional)

- [ ] Implementar upload de fotos dos documentos
- [ ] Adicionar validação de CEP via API (ViaCEP)
- [ ] Implementar notificações push para status de aprovação
- [ ] Adicionar funcionalidade de edição de perfil
- [ ] Implementar chat de suporte

## 🐛 Tratamento de Erros

O sistema trata os seguintes casos de erro:

- Campos obrigatórios vazios
- CPF inválido
- Telefone inválido
- CEP inválido
- CNH inválida
- Data de validade inválida
- Placa inválida
- Erro de conexão com Firebase
- Usuário não autenticado
- Cadastro duplicado

## 📞 Suporte

Em caso de problemas, verifique:
1. Conexão com internet
2. Configuração do Firebase (firebaseConfig.ts)
3. Permissões no Firestore (firestore.rules)
4. Logs no console do app

