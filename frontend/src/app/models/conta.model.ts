export interface Conta {
  id?: number;
  nome: string;
  tipo: TipoConta;
  saldoInicial: number;
  instituicao?: string;
  usuarioId?: number;
  dataCriacao?: Date;
  dataAtualizacao?: Date;
  saldoAtual?: number;
}

export enum TipoConta {
  CORRENTE = 'CORRENTE',
  POUPANCA = 'POUPANCA',
  INVESTIMENTO = 'INVESTIMENTO'
}

export interface ContaRequest {
  nome: string;
  tipo: TipoConta;
  saldoInicial: number;
  instituicao?: string;
}

export interface ContaResponse extends Conta {
  saldoAtual: number;
}

export const TIPO_CONTA_LABELS = {
  [TipoConta.CORRENTE]: 'Conta Corrente',
  [TipoConta.POUPANCA]: 'Poupança',
  [TipoConta.INVESTIMENTO]: 'Investimento'
};

export const TIPO_CONTA_OPTIONS = [
  { value: TipoConta.CORRENTE, label: TIPO_CONTA_LABELS[TipoConta.CORRENTE] },
  { value: TipoConta.POUPANCA, label: TIPO_CONTA_LABELS[TipoConta.POUPANCA] },
  { value: TipoConta.INVESTIMENTO, label: TIPO_CONTA_LABELS[TipoConta.INVESTIMENTO] }
];