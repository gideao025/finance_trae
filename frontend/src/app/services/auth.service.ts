import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

import { environment } from '../../environments/environment';
import { 
  Usuario, 
  UsuarioResponse, 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest 
} from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/auth`;
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'current_user';

  private currentUserSubject = new BehaviorSubject<UsuarioResponse | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.initializeAuth();
  }

  /**
   * Inicializa o estado de autenticação
   */
  private initializeAuth(): void {
    const token = this.getToken();
    const user = this.getCurrentUser();

    if (token && user) {
      this.validateToken(token).subscribe({
        next: (isValid) => {
          if (isValid) {
            this.currentUserSubject.next(user);
            this.isAuthenticatedSubject.next(true);
          } else {
            this.logout();
          }
        },
        error: () => this.logout()
      });
    }
  }

  /**
   * Realiza o login do usuário
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/login`, credentials)
      .pipe(
        tap(response => {
          this.setToken(response.token);
          this.setCurrentUser(response.usuario);
          this.currentUserSubject.next(response.usuario);
          this.isAuthenticatedSubject.next(true);
        }),
        catchError(error => {
          console.error('Erro no login:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Realiza o registro de um novo usuário
   */
  register(userData: RegisterRequest): Observable<any> {
    return this.http.post(`${this.API_URL}/registro`, userData)
      .pipe(
        catchError(error => {
          console.error('Erro no registro:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Realiza o logout do usuário
   */
  logout(): void {
    this.removeToken();
    this.removeCurrentUser();
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  /**
   * Valida se o token ainda é válido
   */
  validateToken(token: string): Observable<boolean> {
    return this.http.post<{ valid: boolean }>(`${this.API_URL}/validar-token`, { token })
      .pipe(
        map(response => response.valid),
        catchError(() => {
          return throwError(() => false);
        })
      );
  }

  /**
   * Renova o token de acesso
   */
  refreshToken(): Observable<LoginResponse> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('Token não encontrado'));
    }

    return this.http.post<LoginResponse>(`${this.API_URL}/refresh`, { token })
      .pipe(
        tap(response => {
          this.setToken(response.token);
        }),
        catchError(error => {
          console.error('Erro ao renovar token:', error);
          this.logout();
          return throwError(() => error);
        })
      );
  }

  /**
   * Verifica se o usuário está autenticado
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getCurrentUser();
    return !!(token && user);
  }

  /**
   * Obtém o token de acesso
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Define o token de acesso
   */
  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Remove o token de acesso
   */
  private removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  /**
   * Obtém o usuário atual
   */
  getCurrentUser(): UsuarioResponse | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }

  /**
   * Define o usuário atual
   */
  private setCurrentUser(user: UsuarioResponse): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  /**
   * Remove o usuário atual
   */
  private removeCurrentUser(): void {
    localStorage.removeItem(this.USER_KEY);
  }

  /**
   * Obtém o ID do usuário atual
   */
  getCurrentUserId(): number | null {
    const user = this.getCurrentUser();
    return user ? user.id : null;
  }

  /**
   * Verifica se o usuário tem um perfil específico
   */
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user ? user.perfil === role : false;
  }

  /**
   * Verifica se o usuário é administrador
   */
  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  /**
   * Obtém o nome do usuário atual
   */
  getCurrentUserName(): string {
    const user = this.getCurrentUser();
    return user ? user.nome : '';
  }

  /**
   * Obtém o email do usuário atual
   */
  getCurrentUserEmail(): string {
    const user = this.getCurrentUser();
    return user ? user.email : '';
  }
}