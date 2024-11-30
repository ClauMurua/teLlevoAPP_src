import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OfrecerViajePage } from './ofrecer-viaje.page';

const routes: Routes = [
  {
    path: '',
    component: OfrecerViajePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OfrecerViajePageRoutingModule {}
