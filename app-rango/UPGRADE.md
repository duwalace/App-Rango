# Guia de Atualização do SDK

## Atualização para SDK 54

### Passos para atualizar o projeto:

### 1. Limpar cache e dependências antigas
```bash
# Remover node_modules e package-lock.json
rm -rf node_modules package-lock.json

# No Windows:
rmdir /s node_modules
del package-lock.json
```

### 2. Instalar as novas dependências
```bash
npm install
```

### 3. Corrigir dependências automaticamente
```bash
npx expo install --fix
```

### 4. Verificar se há problemas de compatibilidade
```bash
npx expo-doctor
```

### 5. Executar o projeto com cache limpo
```bash
npm run clear
```

## Principais mudanças SDK 54:

- **Expo SDK**: 51.0.0 → 54.0.0
- **React Native**: 0.74.5 → 0.76.3
- **React**: 18.2.0 → 18.3.1
- **React Navigation**: Mantido nas versões mais recentes
- **Expo Vector Icons**: 14.0.2 → 14.0.4
- **TypeScript**: 5.3.3 → 5.6.2

## Possíveis problemas e soluções:

### Se encontrar erros de cache:
```bash
npm run reset
```

### Se encontrar problemas com Metro:
```bash
npx expo start --tunnel
```

### Para verificar a saúde do projeto:
```bash
npx expo-doctor
```

## Comandos de atualização recomendados:

1. **Atualizar Expo SDK:**
   ```bash
   npm install expo@^54.0.0
   ```

2. **Corrigir dependências:**
   ```bash
   npx expo install --fix
   ```

3. **Verificar compatibilidade:**
   ```bash
   npx expo-doctor
   ```

## Compatibilidade com Expo Go:

- ✅ **SDK 54**: Compatível com Expo Go mais recente
- ❌ **SDK 51**: Incompatível com Expo Go atual

Para usar SDK 51, você precisaria instalar uma versão específica do Expo Go.