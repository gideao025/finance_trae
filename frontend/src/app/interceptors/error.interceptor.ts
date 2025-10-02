import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AuthService } from '../services/auth.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Ocorreu um erro inesperado';

        if (error.error instanceof ErrorEvent) {
          // Erro do lado do cliente
          errorMessage = `Erro: ${error.error.message}`;
        } else {
          // Erro do lado do servidor
          switch (error.status) {
            case 400:
              errorMessage = this.extractErrorMessage(error) || 'Dados inválidos';
              break;
            case 401:
              errorMessage = 'Não autorizado. Faça login novamente.';
              this.authService.logout();
              break;
            case 403:
              errorMessage = 'Acesso negado';
              break;
            case 404:
              errorMessage = 'Recurso não encontrado';
              break;
            case 409:
              errorMessage = this.extractErrorMessage(error) || 'Conflito de dados';
              break;
            case 422:
              errorMessage = this.extractErrorMessage(error) || 'Dados inválidos';
              break;
            case 500:
              errorMessage = 'Erro interno do servidor';
              break;
            case 503:
              errorMessage = 'Serviço temporariamente indisponível';
              break;
            default:
              errorMessage = `Erro ${error.status}: ${error.message}`;
          }
        }

        // Exibe a mensagem de erro apenas se não for um erro 401 (para evitar spam)
        if (error.status !== 401) {
          this.showErrorMessage(errorMessage);
        }

        return throwError(() => ({
          ...error,
          userMessage: errorMessage
        }));
      })
    );
  }

  private extractErrorMessage(error: HttpErrorResponse): string | null {
    if (error.error) {
      // Tenta extrair a mensagem do erro do backend
      if (typeof error.error === 'string') {
        return error.error;
      }
      
      if (error.error.message) {
        return error.error.message;
      }
      
      if (error.error.error) {
        return error.error.error;
      }
      
      if (error.error.details) {
        return error.error.details;
      }

      // Se for um erro de validação com múltiplos campos
      if (error.error.errors && Array.isArray(error.error.errors)) {
        return error.error.errors.map((err: any) => err.message || err).join(', ');
      }
    }
    
    return null;
  }

  private showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }
}