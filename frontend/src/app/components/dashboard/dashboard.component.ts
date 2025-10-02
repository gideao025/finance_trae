import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ContaService } from '../../services/conta.service';
import { CartaoService } from '../../services/cartao.service';
import { TransacaoService } from '../../services/transacao.service';
import { AuthService } from '../../services/auth.service';

import { Conta } from '../../models/conta.model';
import { Cartao } from '../../models/cartao.model';
import { ResumoFinanceiro } from '../../models/transacao.model';
import { Usuario } from '../../models/usuario.model';

interface DashboardCard {
  title: string;
  value: string;
  icon: string;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

interface RecentTransaction {
  id: number;
  descricao: string;
  valor: number;
  data: Date;
  tipo: string;
  conta?: string;
  cartao?: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  currentUser: Usuario | null = null;
  loading = true;
  
  // Dashboard data
  dashboardCards: DashboardCard[] = [];
  resumoFinanceiro: ResumoFinanceiro | null = null;
  contas: Conta[] = [];
  cartoes: Cartao[] = [];
  recentTransactions: RecentTransaction[] = [];
  
  // Chart data
  chartData: any = null;
  chartOptions: any = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  constructor(
    private contaService: ContaService,
    private cartaoService: CartaoService,
    private transacaoService: TransacaoService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDashboardData(): void {
    this.loading = true;

    forkJoin({
      contas: this.contaService.getContas(),
      cartoes: this.cartaoService.getCartoes(),
      resumoFinanceiro: this.transacaoService.getResumoFinanceiro(),
      transacoesRecentes: this.transacaoService.getTransacoes({ page: 0, size: 5 })
    }).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (data) => {
        this.contas = data.contas.content || data.contas;
        this.cartoes = data.cartoes.content || data.cartoes;
        this.resumoFinanceiro = data.resumoFinanceiro;
        this.recentTransactions = this.mapRecentTransactions(data.transacoesRecentes.content || []);
        
        this.buildDashboardCards();
        this.buildChartData();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar dados do dashboard:', error);
        this.snackBar.open('Erro ao carregar dados do dashboard', 'Fechar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.loading = false;
      }
    });
  }

  private buildDashboardCards(): void {
    const saldoTotal = this.contas.reduce((total, conta) => total + (conta.saldoAtual || 0), 0);
    const limiteTotal = this.cartoes.reduce((total, cartao) => total + cartao.limiteTotal, 0);
    const limiteUtilizado = this.cartoes.reduce((total, cartao) => total + (cartao.limiteUtilizado || 0), 0);
    const limiteDisponivel = limiteTotal - limiteUtilizado;

    this.dashboardCards = [
      {
        title: 'Saldo Total',
        value: this.formatCurrency(saldoTotal),
        icon: 'account_balance_wallet',
        color: 'primary',
        trend: {
          value: 5.2,
          isPositive: true
        }
      },
      {
        title: 'Receitas do Mês',
        value: this.formatCurrency(this.resumoFinanceiro?.totalReceitas || 0),
        icon: 'trending_up',
        color: 'success',
        trend: {
          value: 12.5,
          isPositive: true
        }
      },
      {
        title: 'Despesas do Mês',
        value: this.formatCurrency(this.resumoFinanceiro?.totalDespesas || 0),
        icon: 'trending_down',
        color: 'error',
        trend: {
          value: 3.2,
          isPositive: false
        }
      },
      {
        title: 'Limite Disponível',
        value: this.formatCurrency(limiteDisponivel),
        icon: 'credit_card',
        color: 'warning'
      }
    ];
  }

  private buildChartData(): void {
    if (!this.resumoFinanceiro) return;

    this.chartData = {
      labels: ['Receitas', 'Despesas'],
      datasets: [{
        data: [
          this.resumoFinanceiro.totalReceitas,
          this.resumoFinanceiro.totalDespesas
        ],
        backgroundColor: [
          '#10b981',
          '#ef4444'
        ],
        borderWidth: 0
      }]
    };
  }

  private mapRecentTransactions(transacoes: any[]): RecentTransaction[] {
    return transacoes.map(t => ({
      id: t.id,
      descricao: t.descricao,
      valor: t.valor,
      data: new Date(t.data),
      tipo: t.tipo,
      conta: t.conta?.nome,
      cartao: t.cartao?.nomeDoCartao
    }));
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  }

  getTransactionIcon(tipo: string): string {
    return tipo === 'RECEITA' ? 'arrow_upward' : 'arrow_downward';
  }

  getTransactionColor(tipo: string): string {
    return tipo === 'RECEITA' ? 'success' : 'error';
  }

  navigateToContas(): void {
    // Navigation will be handled by router
  }

  navigateToCartoes(): void {
    // Navigation will be handled by router
  }

  navigateToTransacoes(): void {
    // Navigation will be handled by router
  }

  refreshData(): void {
    this.loadDashboardData();
  }
}