# Sistema de Controle Financeiro - Frontend

Este é o frontend do Sistema de Controle Financeiro, desenvolvido em Angular 17 com Angular Material.

## 🚀 Tecnologias Utilizadas

- **Angular 17** - Framework principal
- **Angular Material** - Biblioteca de componentes UI
- **TypeScript** - Linguagem de programação
- **SCSS** - Pré-processador CSS
- **Chart.js** - Biblioteca para gráficos
- **RxJS** - Programação reativa
- **Angular CDK** - Kit de desenvolvimento de componentes

## 📋 Funcionalidades

### 🏠 Dashboard
- Visão geral das finanças
- Cartões de resumo (receitas, despesas, saldo)
- Gráficos de distribuição de gastos
- Lista de transações recentes
- Ações rápidas para navegação

### 💳 Gestão de Contas
- Listagem de contas bancárias
- Criação e edição de contas
- Filtros e busca
- Exportação de dados
- Visualização de saldos

### 🏦 Gestão de Cartões
- Listagem de cartões de crédito
- Criação e edição de cartões
- Controle de limites (total, usado, disponível)
- Alertas de vencimento
- Filtros por bandeira

### 💰 Gestão de Transações
- Listagem completa de transações
- Criação e edição de transações
- Categorização automática
- Filtros avançados (período, tipo, categoria, conta, cartão)
- Resumos financeiros
- Exportação de relatórios

### 🔐 Autenticação
- Login seguro
- Cadastro de usuários
- Proteção de rotas
- Gerenciamento de sessão

## 🏗️ Estrutura do Projeto

```
src/
├── app/
│   ├── components/           # Componentes da aplicação
│   │   ├── auth/            # Autenticação (login, registro)
│   │   ├── dashboard/       # Dashboard principal
│   │   ├── conta/           # Gestão de contas
│   │   ├── cartao/          # Gestão de cartões
│   │   ├── transacao/       # Gestão de transações
│   │   └── layout/          # Layout principal
│   ├── services/            # Serviços Angular
│   │   ├── auth.service.ts
│   │   ├── conta.service.ts
│   │   ├── cartao.service.ts
│   │   └── transacao.service.ts
│   ├── models/              # Modelos TypeScript
│   │   ├── user.model.ts
│   │   ├── conta.model.ts
│   │   ├── cartao.model.ts
│   │   └── transacao.model.ts
│   ├── guards/              # Guards de rota
│   │   └── auth.guard.ts
│   ├── interceptors/        # Interceptors HTTP
│   │   └── auth.interceptor.ts
│   └── shared/              # Componentes compartilhados
│       ├── components/
│       │   ├── confirm-dialog/
│       │   └── loading/
│       └── shared.module.ts
├── environments/            # Configurações de ambiente
├── assets/                  # Recursos estáticos
└── styles.scss             # Estilos globais
```

## 🛠️ Instalação e Configuração

### Pré-requisitos
- Node.js (versão 18 ou superior)
- npm ou yarn
- Angular CLI

### Passos para instalação

1. **Clone o repositório**
   ```bash
   git clone <url-do-repositorio>
   cd projeto/frontend
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure o ambiente**
   - Copie o arquivo `src/environments/environment.example.ts` para `src/environments/environment.ts`
   - Configure a URL da API backend

4. **Execute o projeto**
   ```bash
   npm start
   ```

5. **Acesse a aplicação**
   - Abra o navegador em `http://localhost:4200`

## 🔧 Scripts Disponíveis

- `npm start` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run build:prod` - Build otimizado para produção
- `npm test` - Executa os testes unitários
- `npm run test:coverage` - Testes com relatório de cobertura
- `npm run lint` - Executa o linter
- `npm run e2e` - Executa testes end-to-end

## 🌐 Configuração de Ambiente

### Desenvolvimento
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  appName: 'Controle Financeiro',
  version: '1.0.0'
};
```

### Produção
```typescript
// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.seudominio.com/api',
  appName: 'Controle Financeiro',
  version: '1.0.0'
};
```

## 🎨 Temas e Estilos

O projeto utiliza Angular Material com tema personalizado:

- **Cores primárias**: Azul (#1976d2)
- **Cores secundárias**: Verde (#4caf50) para receitas, Vermelho (#f44336) para despesas
- **Tipografia**: Roboto
- **Ícones**: Material Icons
- **Responsividade**: Mobile-first design

## 📱 Responsividade

A aplicação é totalmente responsiva e otimizada para:
- 📱 Mobile (320px+)
- 📱 Tablet (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large screens (1440px+)

## 🔒 Segurança

### Autenticação
- JWT tokens para autenticação
- Refresh tokens para renovação automática
- Guards de rota para proteção
- Interceptors para anexar tokens

### Validação
- Validação client-side com Angular Forms
- Sanitização de dados
- Proteção contra XSS

## 🧪 Testes

### Testes Unitários
```bash
npm test
```

### Testes com Cobertura
```bash
npm run test:coverage
```

### Testes E2E
```bash
npm run e2e
```

## 📦 Build e Deploy

### Build de Desenvolvimento
```bash
npm run build
```

### Build de Produção
```bash
npm run build:prod
```

### Deploy
Os arquivos gerados na pasta `dist/` podem ser servidos por qualquer servidor web estático.

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Para suporte e dúvidas:
- 📧 Email: suporte@controlefinanceiro.com
- 📱 WhatsApp: (11) 99999-9999
- 🌐 Website: https://controlefinanceiro.com

## 🔄 Changelog

### v1.0.0 (2024-01-XX)
- ✨ Implementação inicial
- 🏠 Dashboard com resumos financeiros
- 💳 Gestão completa de contas e cartões
- 💰 Sistema de transações
- 🔐 Autenticação e autorização
- 📱 Interface responsiva
- 📊 Gráficos e relatórios

---

**Desenvolvido com ❤️ pela equipe de desenvolvimento**