import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import { ContaService } from '../../../services/conta.service';
import { Conta, TipoConta, TIPO_CONTA_LABELS } from '../../../models/conta.model';

@Component({
  selector: 'app-conta-list',
  templateUrl: './conta-list.component.html',
  styleUrls: ['./conta-list.component.scss']
})
export class ContaListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['nome', 'tipo', 'instituicao', 'saldoInicial', 'saldoAtual', 'dataCriacao', 'actions'];
  dataSource = new MatTableDataSource<Conta>();
  
  loading = true;
  totalElements = 0;
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 50];
  
  // Filters
  searchTerm = '';
  selectedTipo: TipoConta | '' = '';
  selectedInstituicao = '';
  
  // Available filter options
  tiposOptions = Object.values(TipoConta);
  instituicoesOptions: string[] = [];
  
  constructor(
    private contaService: ContaService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadContas();
    this.loadInstituicoes();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadContas(): void {
    this.loading = true;
    
    const params = {
      page: this.paginator?.pageIndex || 0,
      size: this.paginator?.pageSize || this.pageSize,
      search: this.searchTerm,
      tipo: this.selectedTipo || undefined,
      instituicao: this.selectedInstituicao || undefined
    };

    this.contaService.getContasPaginadas(params).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (response) => {
        this.dataSource.data = response.content;
        this.totalElements = response.totalElements;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar contas:', error);
        this.snackBar.open('Erro ao carregar contas', 'Fechar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.loading = false;
      }
    });
  }

  loadInstituicoes(): void {
    this.contaService.getContas().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (contas) => {
        const instituicoes = [...new Set(contas.map(c => c.instituicao).filter(Boolean))];
        this.instituicoesOptions = instituicoes.sort();
      },
      error: (error) => {
        console.error('Erro ao carregar instituições:', error);
      }
    });
  }

  applyFilter(): void {
    this.paginator.firstPage();
    this.loadContas();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedTipo = '';
    this.selectedInstituicao = '';
    this.applyFilter();
  }

  onPageChange(): void {
    this.loadContas();
  }

  getTipoLabel(tipo: TipoConta): string {
    return TIPO_CONTA_LABELS[tipo] || tipo;
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

  getSaldoColor(saldoAtual: number): string {
    if (saldoAtual > 0) return 'success';
    if (saldoAtual < 0) return 'error';
    return 'default';
  }

  navigateToNew(): void {
    this.router.navigate(['/contas/novo']);
  }

  navigateToEdit(conta: Conta): void {
    this.router.navigate(['/contas/editar', conta.id]);
  }

  navigateToView(conta: Conta): void {
    this.router.navigate(['/contas/visualizar', conta.id]);
  }

  deleteConta(conta: Conta): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmar Exclusão',
        message: `Tem certeza que deseja excluir a conta "${conta.nome}"?`,
        confirmText: 'Excluir',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.contaService.deleteConta(conta.id).pipe(
          takeUntil(this.destroy$)
        ).subscribe({
          next: () => {
            this.snackBar.open('Conta excluída com sucesso', 'Fechar', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.loadContas();
          },
          error: (error) => {
            console.error('Erro ao excluir conta:', error);
            this.snackBar.open('Erro ao excluir conta', 'Fechar', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    });
  }

  exportToCSV(): void {
    this.contaService.getContas().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (contas) => {
        const csvData = this.convertToCSV(contas);
        this.downloadCSV(csvData, 'contas.csv');
      },
      error: (error) => {
        console.error('Erro ao exportar contas:', error);
        this.snackBar.open('Erro ao exportar contas', 'Fechar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  private convertToCSV(contas: Conta[]): string {
    const headers = ['Nome', 'Tipo', 'Instituição', 'Saldo Inicial', 'Saldo Atual', 'Data de Criação'];
    const csvArray = [headers.join(',')];

    contas.forEach(conta => {
      const row = [
        `"${conta.nome}"`,
        `"${this.getTipoLabel(conta.tipo)}"`,
        `"${conta.instituicao || ''}"`,
        conta.saldoInicial.toString(),
        (conta.saldoAtual || 0).toString(),
        `"${this.formatDate(conta.dataCriacao)}"`
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
}

// Confirm Dialog Component (will be created separately)
interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
}

import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-dialog',
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <p>{{ data.message }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">{{ data.cancelText }}</button>
      <button mat-raised-button color="warn" (click)="onConfirm()">{{ data.confirmText }}</button>
    </mat-dialog-actions>
  `
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}