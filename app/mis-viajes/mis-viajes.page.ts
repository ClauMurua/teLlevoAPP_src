import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { ViajesService, Viaje } from '../services/viajes.service';
import { AutenticacionService } from '../autenticacion.service';
import { Subscription, merge } from 'rxjs';
import { take } from 'rxjs/operators';
import { ClimaData } from '../services/clima.service';

interface ViajeConClima extends Viaje {
  clima?: ClimaData;
}

@Component({
  selector: 'app-mis-viajes',
  templateUrl: './mis-viajes.page.html',
  styleUrls: ['./mis-viajes.page.scss']
})
export class MisViajesPage implements OnInit, OnDestroy {
  rolActual: 'conductor' | 'pasajero';
  viajesFiltrados: ViajeConClima[] = [];
  usuario: string | null = null;
  isLoading = false;
  ultimaActualizacion = new Date();
  private subscriptions: Subscription[] = [];
  private autoUpdateInterval?: any;

  constructor(
    private viajesService: ViajesService,
    private authService: AutenticacionService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    this.rolActual = this.authService.obtenerRol() || 'pasajero';
    this.usuario = this.authService.obtenerUsuario();
  }

  ngOnInit() {
    this.inicializarDatos();
    this.configurarActualizacionesEnTiempoReal();
    this.iniciarActualizacionAutomatica();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (this.autoUpdateInterval) {
      clearInterval(this.autoUpdateInterval);
    }
  }

  ionViewWillEnter() {
    this.actualizarDatos();
  }

  ionViewWillLeave() {
    if (this.autoUpdateInterval) {
      clearInterval(this.autoUpdateInterval);
    }
  }

  private async inicializarDatos() {
    this.isLoading = true;
    try {
      this.usuario = this.authService.obtenerUsuario();
      await this.cargarViajes();
    } finally {
      this.isLoading = false;
    }
  }

  private configurarActualizacionesEnTiempoReal() {
    const subscription = merge(
      this.viajesService.viajes$,
      this.viajesService.actualizacion$
    ).subscribe(() => {
      this.actualizarDatos(false);
    });
    this.subscriptions.push(subscription);
  }

  private iniciarActualizacionAutomatica() {
    if (this.autoUpdateInterval) {
      clearInterval(this.autoUpdateInterval);
    }
    this.autoUpdateInterval = setInterval(() => {
      this.actualizarDatos(false);
    }, 30000);
  }

  async actualizarDatos(mostrarLoading = true) {
    if (mostrarLoading) this.isLoading = true;
    try {
      await this.cargarViajes();
      this.ultimaActualizacion = new Date();
    } finally {
      if (mostrarLoading) this.isLoading = false;
    }
  }

  async cargarViajes() {
    try {
      console.log('Usuario actual:', this.usuario);
      console.log('Rol actual:', this.rolActual);
      
      const subscription = this.viajesService.obtenerViajesPorRol(this.rolActual)
        .pipe(take(1))
        .subscribe({
          next: (viajes) => {
            console.log('Viajes sin filtrar:', viajes);
            this.viajesFiltrados = viajes;
            console.log('Viajes filtrados:', this.viajesFiltrados);
            
            if (this.viajesFiltrados.length === 0 && this.isLoading) {
              this.mostrarMensaje(`No tienes viajes como ${this.rolActual}`);
            }
          },
          error: (error) => {
            console.error('Error en la suscripción:', error);
            this.mostrarMensaje('Error al cargar los viajes', 'danger');
          }
        });

      this.subscriptions.push(subscription);
    } catch (error) {
      console.error('Error al cargar viajes:', error);
      await this.mostrarMensaje('Error al cargar los viajes', 'danger');
    }
  }

  async handleRefresh(event: any) {
    try {
      await this.actualizarDatos(false);
      await this.mostrarMensaje('Viajes actualizados', 'success');
    } finally {
      event.target.complete();
    }
  }

  actualizarManualmente() {
    this.isLoading = true;
    try {
      this.viajesService.notificarCambioViajes();
      this.actualizarDatos(false);
      this.mostrarMensaje('Viajes actualizados', 'success');
    } finally {
      this.isLoading = false;
    }
  }

  private async mostrarMensaje(mensaje: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      position: 'bottom',
      color: color
    });
    await toast.present();
  }

  formatearFecha(fecha: string): string {
    const fechaObj = new Date(fecha);
    return fechaObj.toLocaleDateString() + ' ' + fechaObj.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}