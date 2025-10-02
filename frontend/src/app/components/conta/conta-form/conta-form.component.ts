import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ContaService } from '../../../services/conta.service';
import { Conta, ContaRequest, TipoConta, TIPO_CONTA_OPTIONS } from '../../../models/conta.model';

@Component({
  selector: 'app-conta-form',
  templateUrl: './conta-form.component.html',
  styleUrls: ['./conta-form.component.scss']
})
export class ContaFormComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  contaForm: FormGroup;
  loading = false;
  isEditMode = false;
  contaId: number | null = null;
  pageTitle = 'Nova Conta';

  tipoContaOptions = TIPO_CONTA_OPTIONS;

  constructor(
    private fb: FormBuilder,
    private contaService: ContaService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.contaForm = this.createForm();
  }

  ngOnInit(): void {
    this.route.params.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      if (params['id']) {
        this.contaId = +params['id'];
        this.isEditMode = true;
        this.pageTitle = 'Editar Conta';
        this.loadConta();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      tipo: ['', Validators.required],
      saldoInicial: [0, [Validators.required, Validators.min(0)]],
      instituicao: ['', [Validators.maxLength(100)]]
    });
  }

  private loadConta(): void {
    if (!this.contaId) return;

    this.loading = true;
    this.contaService.getContaById(this.contaId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (conta) => {
        this.contaForm.patchValue({
          nome: conta.nome,
          tipo: conta.tipo,
          saldoInicial: conta.saldoInicial,
          instituicao: conta.instituicao || ''
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar conta:', error);
        this.snackBar.open('Erro ao carregar conta', 'Fechar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.router.navigate(['/contas']);
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.contaForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.loading = true;
    const formData = this.contaForm.value;
    
    const contaRequest: ContaRequest = {
      nome: formData.nome.trim(),
      tipo: formData.tipo,
      saldoInicial: formData.saldoInicial,
      instituicao: formData.instituicao?.trim() || null
    };

    const operation = this.isEditMode 
      ? this.contaService.updateConta(this.contaId!, contaRequest)
      : this.contaService.createConta(contaRequest);

    operation.pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (conta) => {
        const message = this.isEditMode 
          ? 'Conta atualizada com sucesso' 
          : 'Conta criada com sucesso';
        
        this.snackBar.open(message, 'Fechar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        
        this.router.navigate(['/contas']);
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao salvar conta:', error);
        
        let errorMessage = 'Erro ao salvar conta';
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.status === 409) {
          errorMessage = 'Já existe uma conta com este nome';
        }
        
        this.snackBar.open(errorMessage, 'Fechar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/contas']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.contaForm.controls).forEach(key => {
      const control = this.contaForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.contaForm.get(fieldName);
    
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} é obrigatório`;
      }
      if (field.errors['minlength']) {
        return `${this.getFieldLabel(fieldName)} deve ter pelo menos ${field.errors['minlength'].requiredLength} caracteres`;
      }
      if (field.errors['maxlength']) {
        return `${this.getFieldLabel(fieldName)} deve ter no máximo ${field.errors['maxlength'].requiredLength} caracteres`;
      }
      if (field.errors['min']) {
        return `${this.getFieldLabel(fieldName)} deve ser maior ou igual a ${field.errors['min'].min}`;
      }
    }
    
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      nome: 'Nome',
      tipo: 'Tipo',
      saldoInicial: 'Saldo inicial',
      instituicao: 'Instituição'
    };
    return labels[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.contaForm.get(fieldName);
    return !!(field?.invalid && field.touched);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  onSaldoInicialChange(event: any): void {
    const value = event.target.value;
    const numericValue = parseFloat(value.replace(/[^\d,.-]/g, '').replace(',', '.'));
    
    if (!isNaN(numericValue)) {
      this.contaForm.patchValue({ saldoInicial: numericValue });
    }
  }
}