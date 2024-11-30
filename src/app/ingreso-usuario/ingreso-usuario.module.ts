import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { IngresoUsuarioPageRoutingModule } from './ingreso-usuario-routing.module';
import { IngresoUsuarioPage } from './ingreso-usuario.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    IngresoUsuarioPageRoutingModule
  ],
  declarations: [IngresoUsuarioPage]
})
export class IngresoUsuarioPageModule {}
