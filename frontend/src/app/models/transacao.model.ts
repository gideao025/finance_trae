export interface Transacao {
  id?: number;
  descricao: string;
  valor: number;
  data: Date;
  tipo: TipoTransacao;
  recorrente: boolean;
  contaId?: number;
  cartaoId?: number;
  usuarioId?: number;
  dataCriacao?: Date;
  dataAtualizacao?: Date;
  conta?: {
    id: number;
    nome: string;
  };
  cartao?: {
    id: number;
    nomeDoCartao: string;
  };
}

export enum TipoTransacao {
  RECEITA = 'RECEITA',
  DESPESA = 'DESPESA'
}

export interface TransacaoRequest {
  descricao: string;
  valor: number;
  data: Date;
  tipo: TipoTransacao;
  recorrente: boolean;
  contaId?: number;
  cartaoId?: number;
}

export interface TransacaoResponse extends Transacao {
  conta?: {
    id: number;
    nome: string;
  };
  cartao?: {
    id: number;
    nomeDoCartao: string;
  };
}

export const TIPO_TRANSACAO_LABELS = {
  [TipoTransacao.RECEITA]: 'Receita',
  [TipoTransacao.DESPESA]: 'Despesa'
};

export const TIPO_TRANSACAO_OPTIONS = [
  { value: TipoTransacao.RECEITA, label: TIPO_TRANSACAO_LABELS[TipoTransacao.RECEITA] },
  { value: TipoTransacao.DESPESA, label: TIPO_TRANSACAO_LABELS[TipoTransacao.DESPESA] }
];

export interface TransacaoFilter {
  tipo?: TipoTransacao;
  contaId?: number;
  cartaoId?: number;
  dataInicio?: Date;
  dataFim?: Date;
  descricao?: string;
  recorrente?: boolean;
}

export interface ResumoFinanceiro {
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
  periodo: {
    inicio: Date;
    fim: Date;
  };
}