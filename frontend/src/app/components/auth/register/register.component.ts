import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AuthService } from '../../../services/auth.service';
import { RegisterRequest, PerfilUsuario } from '../../../models/usuario.model';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  isLoading = false;
  hidePassword = true;
  hideConfirmPassword = true;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.checkIfAlreadyLoggedIn();
  }

  private initializeForm(): void {
    this.registerForm = this.formBuilder.group({
      nome: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(50)]],
      confirmarSenha: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  private checkIfAlreadyLoggedIn(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
    }
  }

  private passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const senha = control.get('senha');
    const confirmarSenha = control.get('confirmarSenha');

    if (!senha || !confirmarSenha) {
      return null;
    }

    return senha.value === confirmarSenha.value ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.registerForm.valid && !this.isLoading) {
      this.performRegister();
    } else {
      this.markFormGroupTouched();
    }
  }

  private performRegister(): void {
    this.isLoading = true;
    
    const registerData: RegisterRequest = {
      nome: this.registerForm.value.nome,
      email: this.registerForm.value.email,
      senha: this.registerForm.value.senha,
      perfil: PerfilUsuario.USER
    };

    this.authService.register(registerData).subscribe({
      next: () => {
        this.handleRegisterSuccess();
      },
      error: (error) => {
        this.handleRegisterError(error);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  private handleRegisterSuccess(): void {
    this.snackBar.open('Conta criada com sucesso! Faça login para continuar.', 'Fechar', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });

    this.router.navigate(['/login']);
  }

  private handleRegisterError(error: any): void {
    const errorMessage = error.userMessage || 'Erro ao criar conta. Tente novamente.';
    
    this.snackBar.open(errorMessage, 'Fechar', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.registerForm.get(fieldName);
    
    if (control?.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} é obrigatório`;
    }
    
    if (control?.hasError('email')) {
      return 'Email deve ter um formato válido';
    }
    
    if (control?.hasError('minlength')) {
      const requiredLength = control.errors?.['minlength']?.requiredLength;
      return `${this.getFieldLabel(fieldName)} deve ter pelo menos ${requiredLength} caracteres`;
    }
    
    if (control?.hasError('maxlength')) {
      const maxLength = control.errors?.['maxlength']?.requiredLength;
      return `${this.getFieldLabel(fieldName)} deve ter no máximo ${maxLength} caracteres`;
    }

    if (fieldName === 'confirmarSenha' && this.registerForm.hasError('passwordMismatch')) {
      return 'As senhas não coincidem';
    }
    
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      nome: 'Nome',
      email: 'Email',
      senha: 'Senha',
      confirmarSenha: 'Confirmação de senha'
    };
    return labels[fieldName] || fieldName;
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }
}