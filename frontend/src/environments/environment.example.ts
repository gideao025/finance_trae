export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  appName: 'Controle Financeiro',
  version: '1.0.0',
  
  // Configurações da API
  api: {
    baseUrl: 'http://localhost:8080/api',
    timeout: 30000,
    retryAttempts: 3
  },

  // Configurações de autenticação
  auth: {
    tokenKey: 'auth_token',
    refreshTokenKey: 'refresh_token',
    tokenExpirationKey: 'token_expiration',
    sessionTimeout: 3600000 // 1 hora em millisegundos
  },

  // Configurações de paginação
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [5, 10, 25, 50, 100]
  },

  // Configurações de formatação
  format: {
    currency: 'BRL',
    locale: 'pt-BR',
    dateFormat: 'dd/MM/yyyy',
    dateTimeFormat: 'dd/MM/yyyy HH:mm'
  },

  // Configurações de validação
  validation: {
    minPasswordLength: 8,
    maxFileSize: 5242880, // 5MB em bytes
    allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
  },

  // Configurações de notificação
  notification: {
    duration: 5000, // 5 segundos
    position: 'top-right'
  },

  // Configurações de desenvolvimento
  development: {
    enableLogging: true,
    enableDebugMode: true,
    mockData: false
  },

  // URLs externas
  externalUrls: {
    documentation: 'https://docs.controlefinanceiro.com',
    support: 'https://suporte.controlefinanceiro.com',
    privacy: 'https://controlefinanceiro.com/privacidade',
    terms: 'https://controlefinanceiro.com/termos'
  }
};