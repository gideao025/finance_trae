import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Guards
import { AuthGuard } from './guards/auth.guard';

// Components
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { MainLayoutComponent } from './components/layout/main-layout/main-layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ContaListComponent } from './components/conta/conta-list/conta-list.component';
import { ContaFormComponent } from './components/conta/conta-form/conta-form.component';
import { CartaoListComponent } from './components/cartao/cartao-list/cartao-list.component';
import { CartaoFormComponent } from './components/cartao/cartao-form/cartao-form.component';
import { TransacaoListComponent } from './components/transacao/transacao-list/transacao-list.component';
import { TransacaoFormComponent } from './components/transacao/transacao-form/transacao-form.component';

const routes: Routes = [
  // Rotas públicas (sem autenticação)
  {
    path: 'login',
    component: LoginComponent,
    data: { title: 'Login' }
  },
  {
    path: 'register',
    component: RegisterComponent,
    data: { title: 'Cadastro' }
  },
  
  // Rotas protegidas (com autenticação)
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: '/dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
        data: { title: 'Dashboard' }
      },
      
      // Rotas de Contas
      {
        path: 'contas',
        children: [
          {
            path: '',
            component: ContaListComponent,
            data: { title: 'Contas' }
          },
          {
            path: 'nova',
            component: ContaFormComponent,
            data: { title: 'Nova Conta' }
          },
          {
            path: 'editar/:id',
            component: ContaFormComponent,
            data: { title: 'Editar Conta' }
          }
        ]
      },
      
      // Rotas de Cartões
      {
        path: 'cartoes',
        children: [
          {
            path: '',
            component: CartaoListComponent,
            data: { title: 'Cartões' }
          },
          {
            path: 'novo',
            component: CartaoFormComponent,
            data: { title: 'Novo Cartão' }
          },
          {
            path: 'editar/:id',
            component: CartaoFormComponent,
            data: { title: 'Editar Cartão' }
          }
        ]
      },
      
      // Rotas de Transações
      {
        path: 'transacoes',
        children: [
          {
            path: '',
            component: TransacaoListComponent,
            data: { title: 'Transações' }
          },
          {
            path: 'nova',
            component: TransacaoFormComponent,
            data: { title: 'Nova Transação' }
          },
          {
            path: 'editar/:id',
            component: TransacaoFormComponent,
            data: { title: 'Editar Transação' }
          }
        ]
      }
    ]
  },
  
  // Rota de fallback
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    enableTracing: false, // Definir como true para debug
    scrollPositionRestoration: 'top'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }