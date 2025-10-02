import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import { CartaoService } from '../../../services/cartao.service';
import { Cartao, BANDEIRAS_CARTAO } from '../../../models/cartao.model';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-cartao-list',
  templateUrl: './cartao-list.component.html',
  styleUrls: ['./cartao-list.component.scss']
})
export class CartaoListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['nomeDoCartao', 'bandeira', 'limiteTotal', 'limiteUtilizado', 'limiteDisponivel', 'vencimento', 'actions'];
  dataSource = new MatTableDataSource<Cartao>();
  
  loading = true;
  totalElements = 0;
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 50];
  
  // Filters
  searchTerm = '';
  selectedBandeira = '';
  
  // Available filter options
  bandeirasOptions = BANDEIRAS_CARTAO;
  
  constructor(
    private cartaoService: CartaoService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCartoes();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadCartoes(): void {
    this.loading = true;
    
    const params = {
      page: this.paginator?.pageIndex || 0,
      size: this.paginator?.pageSize || this.pageSize,
      search: this.searchTerm,
      bandeira: this.selectedBandeira || undefined
    };

    this.cartaoService.getCartoesPaginados(params).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        this.dataSource.data = response.content;
        this.totalElements = response.totalElements;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar cartões:', error);
        this.snackBar.open('Erro ao carregar cartões', 'Fechar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    this.paginator.firstPage();
    this.loadCartoes();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedBandeira = '';
    this.applyFilter();
  }

  onPageChange(): void {
    this.loadCartoes();
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

  getVencimentoText(diaDeFechamento: number, diaDeVencimento: number): string {
    return `Fecha: ${diaDeFechamento} | Vence: ${diaDeVencimento}`;
  }

  getLimiteUtilizadoPercentage(cartao: Cartao): number {
    if (cartao.limiteTotal === 0) return 0;
    return ((cartao.limiteUtilizado || 0) / cartao.limiteTotal) * 100;
  }

  getLimiteColor(percentage: number): string {
    if (percentage >= 90) return 'error';
    if (percentage >= 70) return 'warning';
    return 'success';
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

  navigateToNew(): void {
    this.router.navigate(['/cartoes/novo']);
  }

  navigateToEdit(cartao: Cartao): void {
    this.router.navigate(['/cartoes/editar', cartao.id]);
  }

  navigateToView(cartao: Cartao): void {
    this.router.navigate(['/cartoes/visualizar', cartao.id]);
  }

  deleteCartao(cartao: Cartao): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmar Exclusão',
        message: `Tem certeza que deseja excluir o cartão "${cartao.nomeDoCartao}"?`,
        confirmText: 'Excluir',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cartaoService.deleteCartao(cartao.id).pipe(
          takeUntil(this.destroy$)
        ).subscribe({
          next: () => {
            this.snackBar.open('Cartão excluído com sucesso', 'Fechar', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.loadCartoes();
          },
          error: (error) => {
            console.error('Erro ao excluir cartão:', error);
            this.snackBar.open('Erro ao excluir cartão', 'Fechar', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    });
  }

  exportToCSV(): void {
    this.cartaoService.getCartoes().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (cartoes) => {
        const csvData = this.convertToCSV(cartoes);
        this.downloadCSV(csvData, 'cartoes.csv');
      },
      error: (error) => {
        console.error('Erro ao exportar cartões:', error);
        this.snackBar.open('Erro ao exportar cartões', 'Fechar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  private convertToCSV(cartoes: Cartao[]): string {
    const headers = ['Nome', 'Bandeira', 'Limite Total', 'Limite Utilizado', 'Limite Disponível', 'Dia Fechamento', 'Dia Vencimento'];
    const csvArray = [headers.join(',')];

    cartoes.forEach(cartao => {
      const row = [
        `"${cartao.nomeDoCartao}"`,
        `"${cartao.bandeira}"`,
        cartao.limiteTotal.toString(),
        (cartao.limiteUtilizado || 0).toString(),
        (cartao.limiteDisponivel || 0).toString(),
        cartao.diaDeFechamento.toString(),
        cartao.diaDeVencimento.toString()
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

  getCartoesVencendoSoon(): void {
    this.cartaoService.getCartoesVencendoEm(7).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (cartoes) => {
        if (cartoes.length > 0) {
          const nomes = cartoes.map(c => c.nomeDoCartao).join(', ');
          this.snackBar.open(`Cartões vencendo em breve: ${nomes}`, 'Fechar', {
            duration: 8000,
            panelClass: ['warning-snackbar']
          });
        }
      },
      error: (error) => {
        console.error('Erro ao verificar cartões vencendo:', error);
      }
    });
  }
}