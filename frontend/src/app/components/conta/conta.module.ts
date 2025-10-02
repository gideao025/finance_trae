import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

import { ContaListComponent } from './conta-list/conta-list.component';
import { ContaFormComponent } from './conta-form/conta-form.component';

const routes: Routes = [
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
];

@NgModule({
  declarations: [
    ContaListComponent,
    ContaFormComponent
  ],
  imports: [
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class ContaModule { }