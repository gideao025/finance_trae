import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { 
  Transacao, 
  TransacaoRequest, 
  TransacaoResponse, 
  TipoTransacao,
  TransacaoFilter,
  ResumoFinanceiro
} from '../models/transacao.model';
import { PagedResponse } from './conta.service';

@Injectable({
  providedIn: 'root'
})
export class TransacaoService {
  private readonly API_URL = `${environment.apiUrl}/transacoes`;

  constructor(private http: HttpClient) {}

  /**
   * Cria uma nova transação
   */
  criarTransacao(transacao: TransacaoRequest): Observable<TransacaoResponse> {
    return this.http.post<TransacaoResponse>(this.API_URL, transacao)
      .pipe(
        catchError(error => {
          console.error('Erro ao criar transação:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Obtém todas as transações do usuário
   */
  obterTransacoes(): Observable<TransacaoResponse[]> {
    return this.http.get<TransacaoResponse[]>(this.API_URL)
      .pipe(
        catchError(error => {
          console.error('Erro ao obter transações:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Obtém transações com paginação
   */
  obterTransacoesPaginadas(
    page: number = 0, 
    size: number = 10, 
    sort: string = 'data,desc'
  ): Observable<PagedResponse<TransacaoResponse>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    return this.http.get<PagedResponse<TransacaoResponse>>(`${this.API_URL}/paginadas`, { params })
      .pipe(
        catchError(error => {
          console.error('Erro ao obter transações paginadas:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Obtém transações com filtros
   */
  obterTransacoesComFiltros(
    filtros: TransacaoFilter,
    page: number = 0,
    size: number = 10,
    sort: string = 'data,desc'
  ): Observable<PagedResponse<TransacaoResponse>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    if (filtros.tipo) {
      params = params.set('tipo', filtros.tipo);
    }
    if (filtros.contaId) {
      params = params.set('contaId', filtros.contaId.toString());
    }
    if (filtros.cartaoId) {
      params = params.set('cartaoId', filtros.cartaoId.toString());
    }
    if (filtros.dataInicio) {
      params = params.set('dataInicio', filtros.dataInicio.toISOString().split('T')[0]);
    }
    if (filtros.dataFim) {
      params = params.set('dataFim', filtros.dataFim.toISOString().split('T')[0]);
    }
    if (filtros.descricao) {
      params = params.set('descricao', filtros.descricao);
    }
    if (filtros.recorrente !== undefined) {
      params = params.set('recorrente', filtros.recorrente.toString());
    }

    return this.http.get<PagedResponse<TransacaoResponse>>(`${this.API_URL}/filtrar`, { params })
      .pipe(
        catchError(error => {
          console.error('Erro ao obter transações com filtros:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Obtém uma transação por ID
   */
  obterTransacaoPorId(id: number): Observable<TransacaoResponse> {
    return this.http.get<TransacaoResponse>(`${this.API_URL}/${id}`)
      .pipe(
        catchError(error => {
          console.error('Erro ao obter transação por ID:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Obtém transações por conta
   */
  obterTransacoesPorConta(contaId: number): Observable<TransacaoResponse[]> {
    return this.http.get<TransacaoResponse[]>(`${this.API_URL}/conta/${contaId}`)
      .pipe(
        catchError(error => {
          console.error('Erro ao obter transações por conta:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Obtém transações por cartão
   */
  obterTransacoesPorCartao(cartaoId: number): Observable<TransacaoResponse[]> {
    return this.http.get<TransacaoResponse[]>(`${this.API_URL}/cartao/${cartaoId}`)
      .pipe(
        catchError(error => {
          console.error('Erro ao obter transações por cartão:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Obtém transações por tipo
   */
  obterTransacoesPorTipo(tipo: TipoTransacao): Observable<TransacaoResponse[]> {
    return this.http.get<TransacaoResponse[]>(`${this.API_URL}/tipo/${tipo}`)
      .pipe(
        catchError(error => {
          console.error('Erro ao obter transações por tipo:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Obtém transações por período
   */
  obterTransacoesPorPeriodo(
    dataInicio: Date, 
    dataFim: Date
  ): Observable<TransacaoResponse[]> {
    const params = new HttpParams()
      .set('dataInicio', dataInicio.toISOString().split('T')[0])
      .set('dataFim', dataFim.toISOString().split('T')[0]);

    return this.http.get<TransacaoResponse[]>(`${this.API_URL}/periodo`, { params })
      .pipe(
        catchError(error => {
          console.error('Erro ao obter transações por período:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Obtém transações recorrentes
   */
  obterTransacoesRecorrentes(): Observable<TransacaoResponse[]> {
    return this.http.get<TransacaoResponse[]>(`${this.API_URL}/recorrentes`)
      .pipe(
        catchError(error => {
          console.error('Erro ao obter transações recorrentes:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Busca transações por descrição
   */
  buscarTransacoesPorDescricao(descricao: string): Observable<TransacaoResponse[]> {
    const params = new HttpParams().set('descricao', descricao);
    
    return this.http.get<TransacaoResponse[]>(`${this.API_URL}/buscar`, { params })
      .pipe(
        catchError(error => {
          console.error('Erro ao buscar transações por descrição:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Atualiza uma transação
   */
  atualizarTransacao(id: number, transacao: TransacaoRequest): Observable<TransacaoResponse> {
    return this.http.put<TransacaoResponse>(`${this.API_URL}/${id}`, transacao)
      .pipe(
        catchError(error => {
          console.error('Erro ao atualizar transação:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Exclui uma transação
   */
  excluirTransacao(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`)
      .pipe(
        catchError(error => {
          console.error('Erro ao excluir transação:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Calcula o total de receitas
   */
  calcularTotalReceitas(dataInicio?: Date, dataFim?: Date): Observable<number> {
    let params = new HttpParams();
    if (dataInicio) {
      params = params.set('dataInicio', dataInicio.toISOString().split('T')[0]);
    }
    if (dataFim) {
      params = params.set('dataFim', dataFim.toISOString().split('T')[0]);
    }

    return this.http.get<{ total: number }>(`${this.API_URL}/total-receitas`, { params })
      .pipe(
        map(response => response.total),
        catchError(error => {
          console.error('Erro ao calcular total de receitas:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Calcula o total de despesas
   */
  calcularTotalDespesas(dataInicio?: Date, dataFim?: Date): Observable<number> {
    let params = new HttpParams();
    if (dataInicio) {
      params = params.set('dataInicio', dataInicio.toISOString().split('T')[0]);
    }
    if (dataFim) {
      params = params.set('dataFim', dataFim.toISOString().split('T')[0]);
    }

    return this.http.get<{ total: number }>(`${this.API_URL}/total-despesas`, { params })
      .pipe(
        map(response => response.total),
        catchError(error => {
          console.error('Erro ao calcular total de despesas:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Obtém resumo financeiro
   */
  obterResumoFinanceiro(dataInicio?: Date, dataFim?: Date): Observable<ResumoFinanceiro> {
    let params = new HttpParams();
    if (dataInicio) {
      params = params.set('dataInicio', dataInicio.toISOString().split('T')[0]);
    }
    if (dataFim) {
      params = params.set('dataFim', dataFim.toISOString().split('T')[0]);
    }

    return this.http.get<ResumoFinanceiro>(`${this.API_URL}/resumo-financeiro`, { params })
      .pipe(
        catchError(error => {
          console.error('Erro ao obter resumo financeiro:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Conta o número total de transações
   */
  contarTransacoes(): Observable<number> {
    return this.http.get<{ total: number }>(`${this.API_URL}/contar`)
      .pipe(
        map(response => response.total),
        catchError(error => {
          console.error('Erro ao contar transações:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Obtém estatísticas de transações por categoria/tipo
   */
  obterEstatisticasPorTipo(dataInicio?: Date, dataFim?: Date): Observable<{
    tipo: TipoTransacao;
    total: number;
    quantidade: number;
  }[]> {
    let params = new HttpParams();
    if (dataInicio) {
      params = params.set('dataInicio', dataInicio.toISOString().split('T')[0]);
    }
    if (dataFim) {
      params = params.set('dataFim', dataFim.toISOString().split('T')[0]);
    }

    return this.http.get<{
      tipo: TipoTransacao;
      total: number;
      quantidade: number;
    }[]>(`${this.API_URL}/estatisticas-tipo`, { params })
      .pipe(
        catchError(error => {
          console.error('Erro ao obter estatísticas por tipo:', error);
          return throwError(() => error);
        })
      );
  }
}