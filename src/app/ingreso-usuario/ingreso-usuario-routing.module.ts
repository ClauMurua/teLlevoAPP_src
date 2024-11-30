import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { IngresoUsuarioPage } from './ingreso-usuario.page';

const routes: Routes = [
  {
    path: '',
    component: IngresoUsuarioPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IngresoUsuarioPageRoutingModule {}
