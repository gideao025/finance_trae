import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CartaoService } from '../../../services/cartao.service';
import { Cartao, BANDEIRAS_CARTAO } from '../../../models/cartao.model';

@Component({
  selector: 'app-cartao-form',
  templateUrl: './cartao-form.component.html',
  styleUrls: ['./cartao-form.component.scss']
})
export class CartaoFormComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  cartaoForm: FormGroup;
  loading = false;
  isEditMode = false;
  cartaoId: number | null = null;
  
  // Options
  bandeirasOptions = BANDEIRAS_CARTAO;
  
  // Days for dropdown
  diasOptions = Array.from({ length: 31 }, (_, i) => i + 1);

  constructor(
    private fb: FormBuilder,
    private cartaoService: CartaoService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.cartaoForm = this.createForm();
  }

  ngOnInit(): void {
    this.cartaoId = Number(this.route.snapshot.paramMap.get('id'));
    this.isEditMode = !!this.cartaoId;

    if (this.isEditMode) {
      this.loadCartao();
    }

    // Update limite disponível when limite total or utilizado changes
    this.cartaoForm.get('limiteTotal')?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => this.updateLimiteDisponivel());

    this.cartaoForm.get('limiteUtilizado')?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => this.updateLimiteDisponivel());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      nomeDoCartao: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      bandeira: ['', Validators.required],
      limiteTotal: [0, [Validators.required, Validators.min(0)]],
      limiteUtilizado: [0, [Validators.min(0)]],
      limiteDisponivel: [{ value: 0, disabled: true }],
      diaDeFechamento: [1, [Validators.required, Validators.min(1), Validators.max(31)]],
      diaDeVencimento: [10, [Validators.required, Validators.min(1), Validators.max(31)]],
      ultimosDigitos: ['', [Validators.pattern(/^\d{4}$/)]],
      observacoes: ['', Validators.maxLength(500)]
    });
  }

  private loadCartao(): void {
    if (!this.cartaoId) return;

    this.loading = true;
    this.cartaoService.getCartaoById(this.cartaoId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (cartao) => {
        this.cartaoForm.patchValue({
          nomeDoCartao: cartao.nomeDoCartao,
          bandeira: cartao.bandeira,
          limiteTotal: cartao.limiteTotal,
          limiteUtilizado: cartao.limiteUtilizado || 0,
          diaDeFechamento: cartao.diaDeFechamento,
          diaDeVencimento: cartao.diaDeVencimento,
          ultimosDigitos: cartao.ultimosDigitos || '',
          observacoes: cartao.observacoes || ''
        });
        this.updateLimiteDisponivel();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar cartão:', error);
        this.snackBar.open('Erro ao carregar cartão', 'Fechar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.loading = false;
        this.router.navigate(['/cartoes']);
      }
    });
  }

  private updateLimiteDisponivel(): void {
    const limiteTotal = this.cartaoForm.get('limiteTotal')?.value || 0;
    const limiteUtilizado = this.cartaoForm.get('limiteUtilizado')?.value || 0;
    const limiteDisponivel = Math.max(0, limiteTotal - limiteUtilizado);
    
    this.cartaoForm.get('limiteDisponivel')?.setValue(limiteDisponivel);
  }

  onSubmit(): void {
    if (this.cartaoForm.valid) {
      this.loading = true;
      
      const formData = { ...this.cartaoForm.getRawValue() };
      
      // Remove campos calculados/disabled
      delete formData.limiteDisponivel;
      
      // Convert empty strings to null for optional fields
      if (!formData.ultimosDigitos) formData.ultimosDigitos = null;
      if (!formData.observacoes) formData.observacoes = null;
      if (!formData.limiteUtilizado) formData.limiteUtilizado = 0;

      const request = this.isEditMode
        ? this.cartaoService.updateCartao(this.cartaoId!, formData)
        : this.cartaoService.createCartao(formData);

      request.pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          const message = this.isEditMode ? 'Cartão atualizado com sucesso' : 'Cartão criado com sucesso';
          this.snackBar.open(message, 'Fechar', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/cartoes']);
        },
        error: (error) => {
          console.error('Erro ao salvar cartão:', error);
          const message = this.isEditMode ? 'Erro ao atualizar cartão' : 'Erro ao criar cartão';
          this.snackBar.open(message, 'Fechar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          this.loading = false;
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.router.navigate(['/cartoes']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.cartaoForm.controls).forEach(key => {
      const control = this.cartaoForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.cartaoForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${this.getFieldLabel(fieldName)} é obrigatório`;
      if (field.errors['minlength']) return `${this.getFieldLabel(fieldName)} deve ter pelo menos ${field.errors['minlength'].requiredLength} caracteres`;
      if (field.errors['maxlength']) return `${this.getFieldLabel(fieldName)} deve ter no máximo ${field.errors['maxlength'].requiredLength} caracteres`;
      if (field.errors['min']) return `${this.getFieldLabel(fieldName)} deve ser maior ou igual a ${field.errors['min'].min}`;
      if (field.errors['max']) return `${this.getFieldLabel(fieldName)} deve ser menor ou igual a ${field.errors['max'].max}`;
      if (field.errors['pattern']) return `${this.getFieldLabel(fieldName)} deve conter apenas 4 dígitos`;
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      nomeDoCartao: 'Nome do cartão',
      bandeira: 'Bandeira',
      limiteTotal: 'Limite total',
      limiteUtilizado: 'Limite utilizado',
      diaDeFechamento: 'Dia de fechamento',
      diaDeVencimento: 'Dia de vencimento',
      ultimosDigitos: 'Últimos dígitos',
      observacoes: 'Observações'
    };
    return labels[fieldName] || fieldName;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  getLimiteUtilizadoPercentage(): number {
    const limiteTotal = this.cartaoForm.get('limiteTotal')?.value || 0;
    const limiteUtilizado = this.cartaoForm.get('limiteUtilizado')?.value || 0;
    
    if (limiteTotal === 0) return 0;
    return (limiteUtilizado / limiteTotal) * 100;
  }

  getLimiteColor(): string {
    const percentage = this.getLimiteUtilizadoPercentage();
    if (percentage >= 90) return 'warn';
    if (percentage >= 70) return 'accent';
    return 'primary';
  }

  getBandeiraIcon(bandeira: string): string {
    const icons: { [key: string]: string } = {
      'VISA': 'credit_card',
      'MASTERCARD': 'credit_card',
      'ELO': 'credit_card',
      'AMERICAN_EXPRESS': 'credit_card',
      'HIPERCARD': 'credit_card',
      'OUTROS': 'credit_card'
    };
    return icons[bandeira] || 'credit_card';
  }

  // Validation helpers
  isFieldInvalid(fieldName: string): boolean {
    const field = this.cartaoForm.get(fieldName);
    return !!(field?.invalid && field.touched);
  }

  isFieldValid(fieldName: string): boolean {
    const field = this.cartaoForm.get(fieldName);
    return !!(field?.valid && field.touched);
  }

  // Form state helpers
  get isFormValid(): boolean {
    return this.cartaoForm.valid;
  }

  get isFormDirty(): boolean {
    return this.cartaoForm.dirty;
  }

  get pageTitle(): string {
    return this.isEditMode ? 'Editar Cartão' : 'Novo Cartão';
  }

  get pageSubtitle(): string {
    return this.isEditMode 
      ? 'Atualize as informações do cartão de crédito'
      : 'Cadastre um novo cartão de crédito';
  }

  get submitButtonText(): string {
    return this.isEditMode ? 'Atualizar' : 'Criar';
  }
}