# Sistema de Controle Financeiro

Sistema completo de controle financeiro pessoal desenvolvido com Angular (frontend) e Spring Boot (backend).

## 📋 Sobre o Projeto

O Sistema de Controle Financeiro é uma aplicação web moderna que permite aos usuários gerenciar suas finanças pessoais de forma eficiente e intuitiva. O sistema oferece funcionalidades completas para controle de contas bancárias, cartões de crédito, transações financeiras e relatórios detalhados.

## 🚀 Tecnologias Utilizadas

### Frontend
- **Angular 17** - Framework principal
- **Angular Material** - Biblioteca de componentes UI
- **TypeScript** - Linguagem de programação
- **SCSS** - Pré-processador CSS
- **Chart.js** - Biblioteca para gráficos
- **RxJS** - Programação reativa

### Backend
- **Spring Boot 3** - Framework principal
- **Spring Security** - Autenticação e autorização
- **Spring Data JPA** - Persistência de dados
- **PostgreSQL** - Banco de dados
- **Maven** - Gerenciamento de dependências
- **JWT** - Autenticação via tokens

## 📁 Estrutura do Projeto

```
projeto/
├── frontend/                 # Aplicação Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/   # Componentes da aplicação
│   │   │   ├── services/     # Serviços Angular
│   │   │   ├── models/       # Modelos TypeScript
│   │   │   ├── guards/       # Guards de rota
│   │   │   └── shared/       # Componentes compartilhados
│   │   ├── environments/     # Configurações de ambiente
│   │   └── assets/          # Recursos estáticos
│   ├── package.json
│   └── README.md
└── backend/                  # Aplicação Spring Boot
    ├── src/
    │   └── main/
    │       ├── java/         # Código fonte Java
    │       └── resources/    # Recursos e configurações
    ├── pom.xml
    └── README.md
```

## 🎯 Funcionalidades

### 🏠 Dashboard
- Visão geral das finanças
- Resumos de receitas, despesas e saldo
- Gráficos de distribuição de gastos
- Transações recentes
- Ações rápidas

### 💳 Gestão de Contas
- Cadastro e edição de contas bancárias
- Controle de saldos
- Histórico de movimentações
- Filtros e busca avançada

### 🏦 Gestão de Cartões
- Cadastro de cartões de crédito
- Controle de limites (total, usado, disponível)
- Alertas de vencimento
- Gestão por bandeira

### 💰 Gestão de Transações
- Registro completo de transações
- Categorização automática
- Filtros por período, tipo, categoria
- Relatórios e exportação
- Resumos financeiros

### 🔐 Autenticação e Segurança
- Login seguro com JWT
- Cadastro de usuários
- Proteção de rotas
- Criptografia de dados sensíveis

## 🛠️ Instalação e Configuração

### Pré-requisitos
- Node.js 18+
- Java 17+
- PostgreSQL 13+
- Maven 3.8+

### 1. Clone o Repositório
```bash
git clone <url-do-repositorio>
cd projeto
```

### 2. Configuração do Backend
```bash
cd backend
# Configure o banco de dados no application.properties
# Execute a aplicação
mvn spring-boot:run
```

### 3. Configuração do Frontend
```bash
cd frontend
# Instale as dependências
npm install
# Configure o ambiente (copie environment.example.ts para environment.ts)
# Execute a aplicação
npm start
```

### 4. Acesso à Aplicação
- Frontend: http://localhost:4200
- Backend API: http://localhost:8080

## 🔧 Scripts Disponíveis

### Frontend
- `npm start` - Servidor de desenvolvimento
- `npm run build` - Build de produção
- `npm test` - Testes unitários
- `npm run lint` - Linter

### Backend
- `mvn spring-boot:run` - Executar aplicação
- `mvn test` - Executar testes
- `mvn clean package` - Build do projeto

## 🌐 Configuração de Ambiente

### Desenvolvimento
- Frontend: http://localhost:4200
- Backend: http://localhost:8080
- Banco: PostgreSQL local

### Produção
- Configure as variáveis de ambiente
- Use HTTPS para comunicação
- Configure backup do banco de dados

## 📊 API Endpoints

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Cadastro
- `POST /api/auth/refresh` - Renovar token

### Contas
- `GET /api/contas` - Listar contas
- `POST /api/contas` - Criar conta
- `PUT /api/contas/{id}` - Atualizar conta
- `DELETE /api/contas/{id}` - Excluir conta

### Cartões
- `GET /api/cartoes` - Listar cartões
- `POST /api/cartoes` - Criar cartão
- `PUT /api/cartoes/{id}` - Atualizar cartão
- `DELETE /api/cartoes/{id}` - Excluir cartão

### Transações
- `GET /api/transacoes` - Listar transações
- `POST /api/transacoes` - Criar transação
- `PUT /api/transacoes/{id}` - Atualizar transação
- `DELETE /api/transacoes/{id}` - Excluir transação

## 🧪 Testes

### Frontend
```bash
cd frontend
npm test                    # Testes unitários
npm run test:coverage      # Cobertura de testes
npm run e2e               # Testes end-to-end
```

### Backend
```bash
cd backend
mvn test                   # Testes unitários
mvn verify                # Testes de integração
```

## 📦 Deploy

### Frontend
```bash
npm run build:prod
# Deploy dos arquivos da pasta dist/
```

### Backend
```bash
mvn clean package
# Deploy do arquivo .jar gerado
```

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

## 🔄 Roadmap

### v1.1.0
- [ ] Relatórios avançados
- [ ] Metas financeiras
- [ ] Notificações push
- [ ] App mobile

### v1.2.0
- [ ] Integração bancária
- [ ] IA para categorização
- [ ] Dashboard personalizado
- [ ] Multi-moeda

---

**Desenvolvido com ❤️ pela equipe de desenvolvimento**