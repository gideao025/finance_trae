import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { 
  Conta, 
  ContaRequest, 
  ContaResponse, 
  TipoConta 
} from '../models/conta.model';

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ContaService {
  private readonly API_URL = `${environment.apiUrl}/contas`;

  constructor(private http: HttpClient) {}

  /**
   * Cria uma nova conta
   */
  criarConta(conta: ContaRequest): Observable<ContaResponse> {
    return this.http.post<ContaResponse>(this.API_URL, conta)
      .pipe(
        catchError(error => {
          console.error('Erro ao criar conta:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Obtém todas as contas do usuário
   */
  obterContas(): Observable<ContaResponse[]> {
    return this.http.get<ContaResponse[]>(this.API_URL)
      .pipe(
        catchError(error => {
          console.error('Erro ao obter contas:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Obtém contas com paginação
   */
  obterContasPaginadas(
    page: number = 0, 
    size: number = 10, 
    sort: string = 'nome'
  ): Observable<PagedResponse<ContaResponse>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    return this.http.get<PagedResponse<ContaResponse>>(`${this.API_URL}/paginadas`, { params })
      .pipe(
        catchError(error => {
          console.error('Erro ao obter contas paginadas:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Obtém uma conta por ID
   */
  obterContaPorId(id: number): Observable<ContaResponse> {
    return this.http.get<ContaResponse>(`${this.API_URL}/${id}`)
      .pipe(
        catchError(error => {
          console.error('Erro ao obter conta por ID:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Obtém contas por tipo
   */
  obterContasPorTipo(tipo: TipoConta): Observable<ContaResponse[]> {
    return this.http.get<ContaResponse[]>(`${this.API_URL}/tipo/${tipo}`)
      .pipe(
        catchError(error => {
          console.error('Erro ao obter contas por tipo:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Obtém contas por instituição
   */
  obterContasPorInstituicao(instituicao: string): Observable<ContaResponse[]> {
    const params = new HttpParams().set('instituicao', instituicao);
    
    return this.http.get<ContaResponse[]>(`${this.API_URL}/instituicao`, { params })
      .pipe(
        catchError(error => {
          console.error('Erro ao obter contas por instituição:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Busca contas por nome (busca parcial)
   */
  buscarContasPorNome(nome: string): Observable<ContaResponse[]> {
    const params = new HttpParams().set('nome', nome);
    
    return this.http.get<ContaResponse[]>(`${this.API_URL}/buscar`, { params })
      .pipe(
        catchError(error => {
          console.error('Erro ao buscar contas por nome:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Obtém contas ativas
   */
  obterContasAtivas(): Observable<ContaResponse[]> {
    return this.http.get<ContaResponse[]>(`${this.API_URL}/ativas`)
      .pipe(
        catchError(error => {
          console.error('Erro ao obter contas ativas:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Obtém contas sem transações
   */
  obterContasSemTransacoes(): Observable<ContaResponse[]> {
    return this.http.get<ContaResponse[]>(`${this.API_URL}/sem-transacoes`)
      .pipe(
        catchError(error => {
          console.error('Erro ao obter contas sem transações:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Atualiza uma conta
   */
  atualizarConta(id: number, conta: ContaRequest): Observable<ContaResponse> {
    return this.http.put<ContaResponse>(`${this.API_URL}/${id}`, conta)
      .pipe(
        catchError(error => {
          console.error('Erro ao atualizar conta:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Exclui uma conta
   */
  excluirConta(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`)
      .pipe(
        catchError(error => {
          console.error('Erro ao excluir conta:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Calcula o saldo total de todas as contas
   */
  calcularSaldoTotal(): Observable<number> {
    return this.http.get<{ saldoTotal: number }>(`${this.API_URL}/saldo-total`)
      .pipe(
        map(response => response.saldoTotal),
        catchError(error => {
          console.error('Erro ao calcular saldo total:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Conta o número total de contas
   */
  contarContas(): Observable<number> {
    return this.http.get<{ total: number }>(`${this.API_URL}/contar`)
      .pipe(
        map(response => response.total),
        catchError(error => {
          console.error('Erro ao contar contas:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Verifica se existe uma conta com o nome especificado
   */
  verificarNomeExistente(nome: string, idExcluir?: number): Observable<boolean> {
    let params = new HttpParams().set('nome', nome);
    if (idExcluir) {
      params = params.set('idExcluir', idExcluir.toString());
    }

    return this.http.get<{ existe: boolean }>(`${this.API_URL}/verificar-nome`, { params })
      .pipe(
        map(response => response.existe),
        catchError(error => {
          console.error('Erro ao verificar nome existente:', error);
          return throwError(() => error);
        })
      );
  }
}