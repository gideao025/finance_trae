export interface Cartao {
  id?: number;
  nomeDoCartao: string;
  bandeira: string;
  limiteTotal: number;
  diaDeFechamento: number;
  diaDeVencimento: number;
  usuarioId?: number;
  dataCriacao?: Date;
  dataAtualizacao?: Date;
  limiteUtilizado?: number;
  limiteDisponivel?: number;
}

export interface CartaoRequest {
  nomeDoCartao: string;
  bandeira: string;
  limiteTotal: number;
  diaDeFechamento: number;
  diaDeVencimento: number;
}

export interface CartaoResponse extends Cartao {
  limiteUtilizado: number;
  limiteDisponivel: number;
}

export const BANDEIRAS_CARTAO = [
  'Visa',
  'Mastercard',
  'American Express',
  'Elo',
  'Hipercard',
  'Diners Club',
  'Discover',
  'JCB',
  'Outros'
];

export const BANDEIRA_OPTIONS = BANDEIRAS_CARTAO.map(bandeira => ({
  value: bandeira,
  label: bandeira
}));