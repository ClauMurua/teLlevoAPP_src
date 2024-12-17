import { Component, OnInit } from '@angular/core';
import { ClimaService } from '../services/clima.service';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-clima',
  templateUrl: './clima.page.html',
  styleUrls: ['./clima.page.scss'],
})
export class ClimaPage implements OnInit {
  climaActual: any = null;
  mostrarDetalles: boolean = false;
  error: string = '';

  constructor(
    public climaService: ClimaService, // Cambiado a public
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    console.log('Iniciando componente Clima');
    this.obtenerClimaActual();
  }

  async obtenerClimaActual() {
    console.log('Obteniendo clima actual');
    const loading = await this.loadingCtrl.create({
      message: 'Cargando clima...',
      spinner: 'crescent'
    });
    await loading.present();

    this.climaService.obtenerClimaActual()
      .subscribe({
        next: (data) => {
          console.log('Datos del clima recibidos:', data);
          this.climaActual = data;
          this.error = '';
          loading.dismiss();
        },
        error: (error) => {
          console.error('Error al obtener clima:', error);
          this.error = 'Error al obtener el clima';
          this.climaActual = null;
          loading.dismiss();
        }
      });
  }

  obtenerIconoClase(iconCode: string): string {
    return this.climaService.obtenerIconoClase(iconCode);
  }

  toggleDetalles() {
    this.mostrarDetalles = !this.mostrarDetalles;
  }
}