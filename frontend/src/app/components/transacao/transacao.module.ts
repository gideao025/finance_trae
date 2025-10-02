import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

import { TransacaoListComponent } from './transacao-list/transacao-list.component';
import { TransacaoFormComponent } from './transacao-form/transacao-form.component';

const routes: Routes = [
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
];

@NgModule({
  declarations: [
    TransacaoListComponent,
    TransacaoFormComponent
  ],
  imports: [
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class TransacaoModule { }