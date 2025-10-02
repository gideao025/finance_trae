import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import { TransacaoService } from '../../../services/transacao.service';
import { ContaService } from '../../../services/conta.service';
import { CartaoService } from '../../../services/cartao.service';
import { Transacao, TIPOS_TRANSACAO, CATEGORIAS_TRANSACAO } from '../../../models/transacao.model';
import { Conta } from '../../../models/conta.model';
import { Cartao } from '../../../models/cartao.model';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-transacao-list',
  templateUrl: './transacao-list.component.html',
  styleUrls: ['./transacao-list.component.scss']
})
export class TransacaoListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['data', 'descricao', 'categoria', 'tipo', 'valor', 'conta', 'cartao', 'actions'];
  dataSource = new MatTableDataSource<Transacao>();
  
  loading = true;
  totalElements = 0;
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 50];
  
  // Filters
  searchTerm = '';
  selectedTipo = '';
  selectedCategoria = '';
  selectedConta = '';
  selectedCartao = '';
  dataInicio = '';
  dataFim = '';
  
  // Available filter options
  tiposOptions = TIPOS_TRANSACAO;
  categoriasOptions = CATEGORIAS_TRANSACAO;
  contasOptions: Conta[] = [];
  cartoesOptions: Cartao[] = [];
  
  // Summary
  totalReceitas = 0;
  totalDespesas = 0;
  saldoTotal = 0;

  constructor(
    private transacaoService: TransacaoService,
    private contaService: ContaService,
    private cartaoService: CartaoService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadFilterOptions();
    this.loadTransacoes();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private loadFilterOptions(): void {
    // Load contas
    this.contaService.getContas().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (contas) => {
        this.contasOptions = contas;
      },
      error: (error) => {
        console.error('Erro ao carregar contas:', error);
      }
    });

    // Load cartões
    this.cartaoService.getCartoes().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (cartoes) => {
        this.cartoesOptions = cartoes;
      },
      error: (error) => {
        console.error('Erro ao carregar cartões:', error);
      }
    });
  }

  loadTransacoes(): void {
    this.loading = true;
    
    const params = {
      page: this.paginator?.pageIndex || 0,
      size: this.paginator?.pageSize || this.pageSize,
      search: this.searchTerm,
      tipo: this.selectedTipo || undefined,
      categoria: this.selectedCategoria || undefined,
      contaId: this.selectedConta || undefined,
      cartaoId: this.selectedCartao || undefined,
      dataInicio: this.dataInicio || undefined,
      dataFim: this.dataFim || undefined
    };

    this.transacaoService.getTransacoesPaginadas(params).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        this.dataSource.data = response.content;
        this.totalElements = response.totalElements;
        this.calculateSummary(response.content);
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar transações:', error);
        this.snackBar.open('Erro ao carregar transações', 'Fechar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.loading = false;
      }
    });
  }

  private calculateSummary(transacoes: Transacao[]): void {
    this.totalReceitas = transacoes
      .filter(t => t.tipo === 'RECEITA')
      .reduce((sum, t) => sum + t.valor, 0);
    
    this.totalDespesas = transacoes
      .filter(t => t.tipo === 'DESPESA')
      .reduce((sum, t) => sum + t.valor, 0);
    
    this.saldoTotal = this.totalReceitas - this.totalDespesas;
  }

  applyFilter(): void {
    this.paginator.firstPage();
    this.loadTransacoes();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedTipo = '';
    this.selectedCategoria = '';
    this.selectedConta = '';
    this.selectedCartao = '';
    this.dataInicio = '';
    this.dataFim = '';
    this.applyFilter();
  }

  onPageChange(): void {
    this.loadTransacoes();
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  getTipoIcon(tipo: string): string {
    const icons: { [key: string]: string } = {
      'RECEITA': 'trending_up',
      'DESPESA': 'trending_down',
      'TRANSFERENCIA': 'swap_horiz'
    };
    return icons[tipo] || 'help';
  }

  getTipoColor(tipo: string): string {
    const colors: { [key: string]: string } = {
      'RECEITA': 'success',
      'DESPESA': 'error',
      'TRANSFERENCIA': 'info'
    };
    return colors[tipo] || 'default';
  }

  getCategoriaIcon(categoria: string): string {
    const icons: { [key: string]: string } = {
      'ALIMENTACAO': 'restaurant',
      'TRANSPORTE': 'directions_car',
      'MORADIA': 'home',
      'SAUDE': 'local_hospital',
      'EDUCACAO': 'school',
      'LAZER': 'sports_esports',
      'COMPRAS': 'shopping_cart',
      'SERVICOS': 'build',
      'INVESTIMENTOS': 'trending_up',
      'OUTROS': 'category'
    };
    return icons[categoria] || 'category';
  }

  getContaNome(contaId: number): string {
    const conta = this.contasOptions.find(c => c.id === contaId);
    return conta?.nome || 'N/A';
  }

  getCartaoNome(cartaoId: number): string {
    const cartao = this.cartoesOptions.find(c => c.id === cartaoId);
    return cartao?.nomeDoCartao || 'N/A';
  }

  navigateToNew(): void {
    this.router.navigate(['/transacoes/nova']);
  }

  navigateToEdit(transacao: Transacao): void {
    this.router.navigate(['/transacoes/editar', transacao.id]);
  }

  navigateToView(transacao: Transacao): void {
    this.router.navigate(['/transacoes/visualizar', transacao.id]);
  }

  deleteTransacao(transacao: Transacao): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmar Exclusão',
        message: `Tem certeza que deseja excluir a transação "${transacao.descricao}"?`,
        confirmText: 'Excluir',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.transacaoService.deleteTransacao(transacao.id).pipe(
          takeUntil(this.destroy$)
        ).subscribe({
          next: () => {
            this.snackBar.open('Transação excluída com sucesso', 'Fechar', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.loadTransacoes();
          },
          error: (error) => {
            console.error('Erro ao excluir transação:', error);
            this.snackBar.open('Erro ao excluir transação', 'Fechar', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    });
  }

  exportToCSV(): void {
    const params = {
      search: this.searchTerm,
      tipo: this.selectedTipo || undefined,
      categoria: this.selectedCategoria || undefined,
      contaId: this.selectedConta || undefined,
      cartaoId: this.selectedCartao || undefined,
      dataInicio: this.dataInicio || undefined,
      dataFim: this.dataFim || undefined
    };

    this.transacaoService.getTransacoes(params).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (transacoes) => {
        const csvData = this.convertToCSV(transacoes);
        this.downloadCSV(csvData, 'transacoes.csv');
      },
      error: (error) => {
        console.error('Erro ao exportar transações:', error);
        this.snackBar.open('Erro ao exportar transações', 'Fechar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  private convertToCSV(transacoes: Transacao[]): string {
    const headers = ['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor', 'Conta', 'Cartão', 'Observações'];
    const csvArray = [headers.join(',')];

    transacoes.forEach(transacao => {
      const row = [
        `"${this.formatDate(transacao.data)}"`,
        `"${transacao.descricao}"`,
        `"${transacao.categoria}"`,
        `"${transacao.tipo}"`,
        transacao.valor.toString(),
        `"${this.getContaNome(transacao.contaId)}"`,
        `"${transacao.cartaoId ? this.getCartaoNome(transacao.cartaoId) : 'N/A'}"`,
        `"${transacao.observacoes || ''}"`
      ];
      csvArray.push(row.join(','));
    });

    return csvArray.join('\n');
  }

  private downloadCSV(csvData: string, filename: string): void {
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  // Quick filters
  filterByPeriod(period: string): void {
    const today = new Date();
    let startDate: Date;

    switch (period) {
      case 'today':
        startDate = new Date(today);
        this.dataInicio = startDate.toISOString().split('T')[0];
        this.dataFim = today.toISOString().split('T')[0];
        break;
      case 'week':
        startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        this.dataInicio = startDate.toISOString().split('T')[0];
        this.dataFim = today.toISOString().split('T')[0];
        break;
      case 'month':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        this.dataInicio = startDate.toISOString().split('T')[0];
        this.dataFim = today.toISOString().split('T')[0];
        break;
      case 'year':
        startDate = new Date(today.getFullYear(), 0, 1);
        this.dataInicio = startDate.toISOString().split('T')[0];
        this.dataFim = today.toISOString().split('T')[0];
        break;
    }
    
    this.applyFilter();
  }

  filterByType(tipo: string): void {
    this.selectedTipo = tipo;
    this.applyFilter();
  }
}