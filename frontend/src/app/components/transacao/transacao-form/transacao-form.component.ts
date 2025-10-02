import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, forkJoin } from 'rxjs';

import { TransacaoService } from '../../../services/transacao.service';
import { ContaService } from '../../../services/conta.service';
import { CartaoService } from '../../../services/cartao.service';
import { Transacao, TipoTransacao, CategoriaTransacao } from '../../../models/transacao.model';
import { Conta } from '../../../models/conta.model';
import { Cartao } from '../../../models/cartao.model';

@Component({
  selector: 'app-transacao-form',
  templateUrl: './transacao-form.component.html',
  styleUrls: ['./transacao-form.component.scss']
})
export class TransacaoFormComponent implements OnInit {
  transacaoForm: FormGroup;
  isLoading = false;
  isEditMode = false;
  transacaoId?: number;
  
  contas: Conta[] = [];
  cartoes: Cartao[] = [];
  
  tiposTransacao = Object.values(TipoTransacao);
  categoriasTransacao = Object.values(CategoriaTransacao);
  
  // Categorias por tipo
  categoriasPorTipo: { [key in TipoTransacao]: CategoriaTransacao[] } = {
    [TipoTransacao.RECEITA]: [
      CategoriaTransacao.SALARIO,
      CategoriaTransacao.FREELANCE,
      CategoriaTransacao.INVESTIMENTOS,
      CategoriaTransacao.OUTROS
    ],
    [TipoTransacao.DESPESA]: [
      CategoriaTransacao.ALIMENTACAO,
      CategoriaTransacao.TRANSPORTE,
      CategoriaTransacao.MORADIA,
      CategoriaTransacao.SAUDE,
      CategoriaTransacao.EDUCACAO,
      CategoriaTransacao.LAZER,
      CategoriaTransacao.COMPRAS,
      CategoriaTransacao.SERVICOS,
      CategoriaTransacao.OUTROS
    ],
    [TipoTransacao.TRANSFERENCIA]: [
      CategoriaTransacao.TRANSFERENCIA_ENTRE_CONTAS,
      CategoriaTransacao.PAGAMENTO_CARTAO,
      CategoriaTransacao.OUTROS
    ]
  };

  constructor(
    private fb: FormBuilder,
    private transacaoService: TransacaoService,
    private contaService: ContaService,
    private cartaoService: CartaoService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.transacaoForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadInitialData();
    
    // Verificar se é modo de edição
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.transacaoId = +id;
      this.loadTransacao(this.transacaoId);
    }
    
    // Observar mudanças no tipo para filtrar categorias
    this.transacaoForm.get('tipo')?.valueChanges.subscribe(tipo => {
      this.onTipoChange(tipo);
    });
    
    // Observar mudanças no tipo para mostrar/ocultar campos
    this.transacaoForm.get('tipo')?.valueChanges.subscribe(tipo => {
      this.updateFormValidators(tipo);
    });
  }

  private createForm(): FormGroup {
    return this.fb.group({
      descricao: ['', [Validators.required, Validators.maxLength(200)]],
      valor: [null, [Validators.required, Validators.min(0.01)]],
      tipo: [TipoTransacao.DESPESA, Validators.required],
      categoria: ['', Validators.required],
      data: [new Date(), Validators.required],
      contaId: [null],
      cartaoId: [null],
      observacoes: ['', Validators.maxLength(500)]
    });
  }

  private loadInitialData(): void {
    this.isLoading = true;
    
    forkJoin({
      contas: this.contaService.listar(),
      cartoes: this.cartaoService.listar()
    }).subscribe({
      next: (data) => {
        this.contas = data.contas.content || data.contas;
        this.cartoes = data.cartoes.content || data.cartoes;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar dados iniciais:', error);
        this.snackBar.open('Erro ao carregar dados. Tente novamente.', 'Fechar', {
          duration: 5000
        });
        this.isLoading = false;
      }
    });
  }

  private loadTransacao(id: number): void {
    this.isLoading = true;
    
    this.transacaoService.buscarPorId(id).subscribe({
      next: (transacao) => {
        this.transacaoForm.patchValue({
          descricao: transacao.descricao,
          valor: transacao.valor,
          tipo: transacao.tipo,
          categoria: transacao.categoria,
          data: new Date(transacao.data),
          contaId: transacao.contaId,
          cartaoId: transacao.cartaoId,
          observacoes: transacao.observacoes
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar transação:', error);
        this.snackBar.open('Erro ao carregar transação. Tente novamente.', 'Fechar', {
          duration: 5000
        });
        this.router.navigate(['/transacoes']);
      }
    });
  }

  private onTipoChange(tipo: TipoTransacao): void {
    // Limpar categoria quando tipo muda
    this.transacaoForm.get('categoria')?.setValue('');
  }

  private updateFormValidators(tipo: TipoTransacao): void {
    const contaControl = this.transacaoForm.get('contaId');
    const cartaoControl = this.transacaoForm.get('cartaoId');
    
    // Limpar validadores
    contaControl?.clearValidators();
    cartaoControl?.clearValidators();
    
    // Aplicar validadores baseados no tipo
    if (tipo === TipoTransacao.DESPESA) {
      // Para despesas, deve ter conta OU cartão
      this.transacaoForm.addValidators(this.contaOuCartaoValidator);
    } else {
      // Para receitas e transferências, deve ter conta
      contaControl?.setValidators([Validators.required]);
    }
    
    contaControl?.updateValueAndValidity();
    cartaoControl?.updateValueAndValidity();
    this.transacaoForm.updateValueAndValidity();
  }

  private contaOuCartaoValidator = (form: FormGroup) => {
    const contaId = form.get('contaId')?.value;
    const cartaoId = form.get('cartaoId')?.value;
    
    if (!contaId && !cartaoId) {
      return { contaOuCartaoRequired: true };
    }
    
    return null;
  };

  onSubmit(): void {
    if (this.transacaoForm.valid) {
      this.isLoading = true;
      
      const formData = this.transacaoForm.value;
      const transacao: Partial<Transacao> = {
        ...formData,
        data: this.formatDate(formData.data)
      };

      const operation = this.isEditMode
        ? this.transacaoService.atualizar(this.transacaoId!, transacao)
        : this.transacaoService.criar(transacao);

      operation.subscribe({
        next: () => {
          const message = this.isEditMode
            ? 'Transação atualizada com sucesso!'
            : 'Transação criada com sucesso!';
          
          this.snackBar.open(message, 'Fechar', {
            duration: 3000
          });
          
          this.router.navigate(['/transacoes']);
        },
        error: (error) => {
          console.error('Erro ao salvar transação:', error);
          this.snackBar.open('Erro ao salvar transação. Tente novamente.', 'Fechar', {
            duration: 5000
          });
          this.isLoading = false;
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.router.navigate(['/transacoes']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.transacaoForm.controls).forEach(key => {
      const control = this.transacaoForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.transacaoForm.get(fieldName);
    
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} é obrigatório`;
      }
      if (field.errors['maxlength']) {
        return `${this.getFieldLabel(fieldName)} deve ter no máximo ${field.errors['maxlength'].requiredLength} caracteres`;
      }
      if (field.errors['min']) {
        return `${this.getFieldLabel(fieldName)} deve ser maior que ${field.errors['min'].min}`;
      }
    }
    
    // Erro customizado para conta ou cartão
    if (this.transacaoForm.errors?.['contaOuCartaoRequired'] && 
        (fieldName === 'contaId' || fieldName === 'cartaoId')) {
      return 'Selecione uma conta ou cartão';
    }
    
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      descricao: 'Descrição',
      valor: 'Valor',
      tipo: 'Tipo',
      categoria: 'Categoria',
      data: 'Data',
      contaId: 'Conta',
      cartaoId: 'Cartão',
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

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  getCategoriasDisponiveis(): CategoriaTransacao[] {
    const tipo = this.transacaoForm.get('tipo')?.value;
    return tipo ? this.categoriasPorTipo[tipo] : [];
  }

  getCategoriaLabel(categoria: CategoriaTransacao): string {
    const labels: { [key in CategoriaTransacao]: string } = {
      [CategoriaTransacao.ALIMENTACAO]: 'Alimentação',
      [CategoriaTransacao.TRANSPORTE]: 'Transporte',
      [CategoriaTransacao.MORADIA]: 'Moradia',
      [CategoriaTransacao.SAUDE]: 'Saúde',
      [CategoriaTransacao.EDUCACAO]: 'Educação',
      [CategoriaTransacao.LAZER]: 'Lazer',
      [CategoriaTransacao.COMPRAS]: 'Compras',
      [CategoriaTransacao.SERVICOS]: 'Serviços',
      [CategoriaTransacao.SALARIO]: 'Salário',
      [CategoriaTransacao.FREELANCE]: 'Freelance',
      [CategoriaTransacao.INVESTIMENTOS]: 'Investimentos',
      [CategoriaTransacao.TRANSFERENCIA_ENTRE_CONTAS]: 'Transferência entre Contas',
      [CategoriaTransacao.PAGAMENTO_CARTAO]: 'Pagamento de Cartão',
      [CategoriaTransacao.OUTROS]: 'Outros'
    };
    
    return labels[categoria];
  }

  getTipoLabel(tipo: TipoTransacao): string {
    const labels: { [key in TipoTransacao]: string } = {
      [TipoTransacao.RECEITA]: 'Receita',
      [TipoTransacao.DESPESA]: 'Despesa',
      [TipoTransacao.TRANSFERENCIA]: 'Transferência'
    };
    
    return labels[tipo];
  }

  getTipoIcon(tipo: TipoTransacao): string {
    const icons: { [key in TipoTransacao]: string } = {
      [TipoTransacao.RECEITA]: 'trending_up',
      [TipoTransacao.DESPESA]: 'trending_down',
      [TipoTransacao.TRANSFERENCIA]: 'swap_horiz'
    };
    
    return icons[tipo];
  }

  getCategoriaIcon(categoria: CategoriaTransacao): string {
    const icons: { [key in CategoriaTransacao]: string } = {
      [CategoriaTransacao.ALIMENTACAO]: 'restaurant',
      [CategoriaTransacao.TRANSPORTE]: 'directions_car',
      [CategoriaTransacao.MORADIA]: 'home',
      [CategoriaTransacao.SAUDE]: 'local_hospital',
      [CategoriaTransacao.EDUCACAO]: 'school',
      [CategoriaTransacao.LAZER]: 'sports_esports',
      [CategoriaTransacao.COMPRAS]: 'shopping_cart',
      [CategoriaTransacao.SERVICOS]: 'build',
      [CategoriaTransacao.SALARIO]: 'work',
      [CategoriaTransacao.FREELANCE]: 'laptop',
      [CategoriaTransacao.INVESTIMENTOS]: 'trending_up',
      [CategoriaTransacao.TRANSFERENCIA_ENTRE_CONTAS]: 'swap_horiz',
      [CategoriaTransacao.PAGAMENTO_CARTAO]: 'credit_card',
      [CategoriaTransacao.OUTROS]: 'category'
    };
    
    return icons[categoria];
  }

  // Getters para template
  get isContaRequired(): boolean {
    const tipo = this.transacaoForm.get('tipo')?.value;
    return tipo === TipoTransacao.RECEITA || tipo === TipoTransacao.TRANSFERENCIA;
  }

  get isCartaoVisible(): boolean {
    const tipo = this.transacaoForm.get('tipo')?.value;
    return tipo === TipoTransacao.DESPESA;
  }

  get previewData() {
    const formValue = this.transacaoForm.value;
    const conta = this.contas.find(c => c.id === formValue.contaId);
    const cartao = this.cartoes.find(c => c.id === formValue.cartaoId);
    
    return {
      ...formValue,
      conta: conta?.nome,
      cartao: cartao?.nome,
      tipoLabel: this.getTipoLabel(formValue.tipo),
      categoriaLabel: this.getCategoriaLabel(formValue.categoria),
      valorFormatado: formValue.valor ? this.formatCurrency(formValue.valor) : 'R$ 0,00'
    };
  }
}