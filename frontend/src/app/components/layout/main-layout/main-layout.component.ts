import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';

import { AuthService } from '../../../services/auth.service';
import { UsuarioResponse } from '../../../models/usuario.model';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  children?: MenuItem[];
}

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  @ViewChild('drawer') drawer!: MatSidenav;
  
  private destroy$ = new Subject<void>();
  
  currentUser: UsuarioResponse | null = null;
  isHandset = false;
  currentRoute = '';
  
  menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/dashboard'
    },
    {
      label: 'Contas',
      icon: 'account_balance',
      route: '/contas'
    },
    {
      label: 'Cartões',
      icon: 'credit_card',
      route: '/cartoes'
    },
    {
      label: 'Transações',
      icon: 'receipt_long',
      route: '/transacoes'
    }
  ];

  constructor(
    private breakpointObserver: BreakpointObserver,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.observeBreakpoints();
    this.observeCurrentUser();
    this.observeRouteChanges();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private observeBreakpoints(): void {
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        this.isHandset = result.matches;
      });
  }

  private observeCurrentUser(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });
  }

  private observeRouteChanges(): void {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.url;
        
        // Fecha o drawer em dispositivos móveis após navegação
        if (this.isHandset && this.drawer) {
          this.drawer.close();
        }
      });
  }

  isActiveRoute(route: string): boolean {
    if (route === '/dashboard') {
      return this.currentRoute === '/' || this.currentRoute === '/dashboard';
    }
    return this.currentRoute.startsWith(route);
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  logout(): void {
    this.authService.logout();
  }

  toggleDrawer(): void {
    if (this.drawer) {
      this.drawer.toggle();
    }
  }

  getUserInitials(): string {
    if (!this.currentUser?.nome) {
      return 'U';
    }
    
    const names = this.currentUser.nome.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    
    return this.currentUser.nome[0].toUpperCase();
  }

  getPageTitle(): string {
    const route = this.currentRoute;
    
    if (route === '/' || route === '/dashboard') {
      return 'Dashboard';
    }
    
    if (route.startsWith('/contas')) {
      return 'Contas';
    }
    
    if (route.startsWith('/cartoes')) {
      return 'Cartões';
    }
    
    if (route.startsWith('/transacoes')) {
      return 'Transações';
    }
    
    return 'Controle Financeiro';
  }
}