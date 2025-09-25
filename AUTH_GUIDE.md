# Guia de Autenticação - App iFood

## Tela de Autenticação (AuthScreen)

### Funcionalidades Implementadas:

#### 🎨 **Design e Layout:**
- ✅ Imagem de fundo em tela cheia
- ✅ StatusBar com conteúdo claro (ícones brancos)
- ✅ Sheet de ações ancorado na parte inferior
- ✅ Cantos superiores arredondados no sheet
- ✅ Botão flutuante de ajuda no canto superior direito

#### 🔘 **Botões de Ação:**
- ✅ Botão primário: "Já tenho uma conta" (fundo vermelho)
- ✅ Botão secundário: "Criar nova conta" (borda vermelha)
- ✅ Componente AuthButton reutilizável com variantes

#### 🌐 **Login Social:**
- ✅ Seção "Acessar com"
- ✅ Botões circulares para Google e Facebook
- ✅ Ícones das redes sociais

#### 🧭 **Navegação:**
- ✅ Apresentação modal (sobe de baixo para cima)
- ✅ Integração com ProfileScreen
- ✅ Stack navigation configurada

### Como usar:

1. **Na ProfileScreen**, clique em "Entrar ou cadastrar-se"
2. **A AuthScreen** será apresentada como modal
3. **Escolha uma opção:**
   - "Já tenho uma conta" → Login
   - "Criar nova conta" → Cadastro
   - Botões sociais → Autenticação social

### Próximos passos:

- [ ] Implementar telas de Login e Cadastro
- [ ] Integrar autenticação com Google/Facebook
- [ ] Adicionar validações de formulário
- [ ] Implementar gerenciamento de estado de autenticação