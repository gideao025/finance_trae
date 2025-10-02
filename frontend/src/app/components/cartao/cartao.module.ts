import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

import { CartaoListComponent } from './cartao-list/cartao-list.component';
import { CartaoFormComponent } from './cartao-form/cartao-form.component';

const routes: Routes = [
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
];

@NgModule({
  declarations: [
    CartaoListComponent,
    CartaoFormComponent
  ],
  imports: [
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class CartaoModule { }