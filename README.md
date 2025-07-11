# Rastreador de Calorias Moderno com Firebase

Um aplicativo completo para rastreamento de calorias, exercícios e histórico de peso, desenvolvido com React, TypeScript, Tailwind CSS e Firebase.

## 🚀 Funcionalidades

### ✅ Autenticação e Sincronização
- **Login com Google** via Firebase Auth
- **Sincronização em nuvem** com Firestore
- **Dados seguros** com regras de segurança
- **Acesso multiplataforma** aos seus dados

### ✅ Rastreamento de Calorias
- Busca inteligente de calorias por IA
- Base de dados local com mais de 50 alimentos
- Cache estável para resultados consistentes
- Adição rápida de alimentos comuns

### ✅ Scanner de Código de Barras
- **Detecção automática** de códigos de barras
- **Busca online** quando conectado à internet
- **Base expandida** com produtos brasileiros
- **Interface melhorada** com feedback visual

### ✅ Perfil Avançado
- **Modo Básico/Avançado** com toggle
- **Campos avançados**: % gordura corporal, cintura, massa magra
- **Cálculos precisos**: TMB com fórmula Katch-McArdle
- **Objetivos personalizados** de peso e metas semanais

### ✅ Registro de Exercícios
- Biblioteca de exercícios comuns
- Cálculo automático de calorias queimadas
- Histórico completo de atividades

### ✅ Histórico de Medidas
- **Tabs para peso e cintura** com navegação intuitiva
- **Gráficos comparativos** para ambas as medidas
- **Tendências individuais** para cada métrica
- Indicador de tendência (ganho/perda)

### ✅ Dashboard de Evolução
- **Gráficos visuais** de peso e cintura
- **Estatísticas detalhadas** de progresso
- **Sistema de conquistas** baseado em marcos
- **Tendências semanais** e análise de progresso
- **Linha da meta** no gráfico de peso

### ✅ Sistema de Alertas Inteligentes
- **Alertas personalizados** baseados em comportamento
- **Notificações contextuais** (hidratação, metas, etc.)
- **Priorização por importância** (alta, média, baixa)
- **Feedback visual** com cores e ícones apropriados

### ✅ Cálculos Automáticos
- **IMC** (Índice de Massa Corporal)
- **TMB** (Taxa Metabólica Basal) - Fórmulas Harris-Benedict e Katch-McArdle
- **TDEE** (Gasto Energético Total Diário)
- Metas personalizadas baseadas no perfil

### ✅ Exportação de Dados
- Exportar para Excel (.xlsx)
- Gerar relatórios em PDF
- Backup completo dos dados

## 🛠️ Tecnologias Utilizadas

- **React 18** com TypeScript
- **Firebase** (Auth + Firestore)
- **Tailwind CSS** para estilização
- **Lucide React** para ícones
- **Vite** como bundler

## 🔧 Configuração do Firebase

### 1. Criar Projeto no Firebase
1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Criar projeto"
3. Siga as instruções para configurar o projeto

### 2. Configurar Authentication
1. No console do Firebase, vá para "Authentication"
2. Clique em "Começar"
3. Na aba "Sign-in method", ative "Google"
4. Configure o domínio autorizado (adicione seu domínio de produção)

### 3. Configurar Firestore
1. No console do Firebase, vá para "Firestore Database"
2. Clique em "Criar banco de dados"
3. Escolha "Começar no modo de teste" (temporário)
4. Selecione a localização do banco

### 4. Configurar Regras de Segurança
Substitua as regras padrão do Firestore por:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 5. Obter Configuração
1. No console do Firebase, vá para "Configurações do projeto"
2. Na seção "Seus apps", clique no ícone da web
3. Copie a configuração do Firebase
4. Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
VITE_FIREBASE_API_KEY=sua-api-key-aqui
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto-id
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=sua-app-id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

## 📱 Estrutura de Dados no Firestore

```
users/{userId}/
├── profile/
│   ├── info (UserInfo)
│   └── macroGoals (MacroGoals)
├── dailyData/{date}/
│   ├── foods/{foodId}
│   └── exercises/{exerciseId}
├── weightHistory/{entryId}
├── waistHistory/{entryId}
├── recipes/{recipeId}
└── alerts/{alertId}
```

## 🚀 Como Executar

1. Clone o repositório
2. Instale as dependências: `npm install`
3. Configure o Firebase (veja seção acima)
4. Crie o arquivo `.env` com suas configurações do Firebase
5. Execute o projeto: `npm run dev`
6. Acesse: `http://localhost:5173`

## 🚀 Deploy

### Netlify
1. **Conecte seu repositório** ao Netlify
2. **Configure as variáveis de ambiente** no painel do Netlify:
   - Vá em Site settings > Environment variables
   - Adicione todas as variáveis VITE_FIREBASE_*
3. **Configure o build**:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. **Deploy automático** será feito a cada push

#### Variáveis de Ambiente no Netlify:
```
VITE_FIREBASE_API_KEY=sua-api-key-aqui
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto-id
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=sua-app-id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
npm run build
firebase init hosting
firebase deploy
```

## 🔒 Segurança

- **Autenticação obrigatória** para todos os dados
- **Regras de segurança** no Firestore
- **Dados isolados por usuário**
- **Validação no frontend e backend**

## 📊 Funcionalidades Principais

### Dashboard
- Resumo diário de calorias com alertas inteligentes
- Progresso visual da meta
- Lista de alimentos e exercícios do dia

### Perfil Pessoal
- Informações básicas e avançadas
- Cálculos automáticos de IMC, TMB e TDEE
- Toggle para modo atleta/avançado

### Histórico Completo
- Visualização por data
- Histórico de peso e cintura com gráficos
- Dashboard de evolução com conquistas

### Scanner de Código de Barras
- Detecção automática e busca online
- Base de produtos brasileiros
- Interface intuitiva com feedback

### Sincronização
- Dados salvos automaticamente na nuvem
- Acesso de qualquer dispositivo
- Backup automático e seguro

## 🔧 Solução de Problemas

### Tela Branca Após Login
1. Verifique se todas as variáveis de ambiente estão configuradas
2. Verifique o console do navegador para erros
3. Certifique-se de que as regras do Firestore estão corretas
4. Verifique se o domínio está autorizado no Firebase Auth

### Erro de Configuração do Firebase
1. Verifique se o arquivo `.env` está na raiz do projeto
2. Certifique-se de que todas as variáveis começam com `VITE_`
3. Reinicie o servidor de desenvolvimento após alterar o `.env`

### Problemas de Sincronização
1. Verifique a conexão com a internet
2. Verifique se o usuário está autenticado
3. Verifique as regras de segurança do Firestore

### Deploy no Netlify
1. **Domínio autorizado**: Adicione seu domínio Netlify no Firebase Auth
   - Vá em Authentication > Settings > Authorized domains
   - Adicione: `nimble-meerkat-8a3ad7.netlify.app`
2. **Variáveis de ambiente**: Configure todas as variáveis VITE_FIREBASE_* no Netlify
3. **Build settings**: Certifique-se de que está usando `npm run build` e `dist/`

## 🎯 Próximas Funcionalidades

- [ ] Integração com Google Fit
- [ ] Notificações push
- [ ] Modo offline com sincronização
- [ ] Compartilhamento de progresso
- [ ] Metas personalizadas de macronutrientes

## 📄 Licença

Este projeto está sob a licença MIT.

---

Desenvolvido com ❤️ para ajudar você a manter uma vida mais saudável!