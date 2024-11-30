import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { OfrecerViajePageRoutingModule } from './ofrecer-viaje-routing.module';
import { OfrecerViajePage } from './ofrecer-viaje.page';
import { HttpClientModule } from '@angular/common/http';

// Material Imports
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button'; // Añadido para botones Material
import { MatIconModule } from '@angular/material/icon'; // Añadido para iconos Material

// Service
import { ClimaService } from '../services/clima.service'; // Asegúrate de que la ruta sea correcta

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    HttpClientModule,
    OfrecerViajePageRoutingModule,
    // Material Modules
    MatDatepickerModule,
    MatInputModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatSelectModule,
    MatOptionModule,
    MatButtonModule,
    MatIconModule
  ],
  declarations: [OfrecerViajePage],
  providers: [
    ClimaService,
    MatDatepickerModule,
    MatNativeDateModule
  ]
})
export class OfrecerViajePageModule {}