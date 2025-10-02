import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { 
  Cartao, 
  CartaoRequest, 
  CartaoResponse 
} from '../models/cartao.model';
import { PagedResponse } from './conta.service';

@Injectable({
  providedIn: 'root'
})
export class CartaoService {
  private readonly API_URL = `${environment.apiUrl}/cartoes`;

  constructor(private http: HttpClient) {}

  /**
   * Cria um novo cartão
   */
  criarCartao(cartao: CartaoRequest): Observable<CartaoResponse> {
    return this.http.post<CartaoResponse>(this.API_URL, cartao)
      .pipe(
        catchError(error => {
          console.error('Erro ao criar cartão:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Obtém todos os cartões do usuário
   */
  obterCartoes(): Observable<CartaoResponse[]> {
    return this.http.get<CartaoResponse[]>(this.API_URL)
      .pipe(
        catchError(error => {
          console.error('Erro ao obter cartões:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Obtém cartões com paginação
   */
  obterCartoesPaginados(
    page: number = 0, 
    size: number = 10, 
    sort: string = 'nomeDoCartao'
  ): Observable<PagedResponse<CartaoResponse>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    return this.http.get<PagedResponse<CartaoResponse>>(`${this.API_URL}/paginados`, { params })
      .pipe(
        catchError(error => {
          console.error('Erro ao obter cartões paginados:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Obtém um cartão por ID
   */
  obterCartaoPorId(id: number): Observable<CartaoResponse> {
    return this.http.get<CartaoResponse>(`${this.API_URL}/${id}`)
      .pipe(
        catchError(error => {
          console.error('Erro ao obter cartão por ID:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Obtém cartões por bandeira
   */
  obterCartoesPorBandeira(bandeira: string): Observable<CartaoResponse[]> {
    const params = new HttpParams().set('bandeira', bandeira);
    
    return this.http.get<CartaoResponse[]>(`${this.API_URL}/bandeira`, { params })
      .pipe(
        catchError(error => {
          console.error('Erro ao obter cartões por bandeira:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Busca cartões por nome (busca parcial)
   */
  buscarCartoesPorNome(nome: string): Observable<CartaoResponse[]> {
    const params = new HttpParams().set('nome', nome);
    
    return this.http.get<CartaoResponse[]>(`${this.API_URL}/buscar`, { params })
      .pipe(
        catchError(error => {
          console.error('Erro ao buscar cartões por nome:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Obtém cartões por dia de fechamento
   */
  obterCartoesPorDiaFechamento(dia: number): Observable<CartaoResponse[]> {
    const params = new HttpParams().set('dia', dia.toString());
    
    return this.http.get<CartaoResponse[]>(`${this.API_URL}/dia-fechamento`, { params })
      .pipe(
        catchError(error => {
          console.error('Erro ao obter cartões por dia de fechamento:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Obtém cartões por dia de vencimento
   */
  obterCartoesPorDiaVencimento(dia: number): Observable<CartaoResponse[]> {
    const params = new HttpParams().set('dia', dia.toString());
    
    return this.http.get<CartaoResponse[]>(`${this.API_URL}/dia-vencimento`, { params })
      .pipe(
        catchError(error => {
          console.error('Erro ao obter cartões por dia de vencimento:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Atualiza um cartão
   */
  atualizarCartao(id: number, cartao: CartaoRequest): Observable<CartaoResponse> {
    return this.http.put<CartaoResponse>(`${this.API_URL}/${id}`, cartao)
      .pipe(
        catchError(error => {
          console.error('Erro ao atualizar cartão:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Exclui um cartão
   */
  excluirCartao(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`)
      .pipe(
        catchError(error => {
          console.error('Erro ao excluir cartão:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Calcula o limite total de todos os cartões
   */
  calcularLimiteTotal(): Observable<number> {
    return this.http.get<{ limiteTotal: number }>(`${this.API_URL}/limite-total`)
      .pipe(
        map(response => response.limiteTotal),
        catchError(error => {
          console.error('Erro ao calcular limite total:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Conta o número total de cartões
   */
  contarCartoes(): Observable<number> {
    return this.http.get<{ total: number }>(`${this.API_URL}/contar`)
      .pipe(
        map(response => response.total),
        catchError(error => {
          console.error('Erro ao contar cartões:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Verifica se existe um cartão com o nome especificado
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

  /**
   * Obtém cartões que vencem em um período específico
   */
  obterCartoesVencendoEm(dias: number): Observable<CartaoResponse[]> {
    const params = new HttpParams().set('dias', dias.toString());
    
    return this.http.get<CartaoResponse[]>(`${this.API_URL}/vencendo-em`, { params })
      .pipe(
        catchError(error => {
          console.error('Erro ao obter cartões vencendo:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Obtém resumo de utilização dos cartões
   */
  obterResumoUtilizacao(): Observable<{
    totalCartoes: number;
    limiteTotal: number;
    limiteUtilizado: number;
    limiteDisponivel: number;
    percentualUtilizacao: number;
  }> {
    return this.http.get<{
      totalCartoes: number;
      limiteTotal: number;
      limiteUtilizado: number;
      limiteDisponivel: number;
      percentualUtilizacao: number;
    }>(`${this.API_URL}/resumo-utilizacao`)
      .pipe(
        catchError(error => {
          console.error('Erro ao obter resumo de utilização:', error);
          return throwError(() => error);
        })
      );
  }
}