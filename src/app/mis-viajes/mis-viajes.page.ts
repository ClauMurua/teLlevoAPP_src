import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { ViajesService, Viaje } from '../services/viajes.service';
import { AutenticacionService } from '../autenticacion.service';
import { Subscription, merge } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-mis-viajes',
  templateUrl: './mis-viajes.page.html',
  styleUrls: ['./mis-viajes.page.scss']
})
export class MisViajesPage implements OnInit, OnDestroy {
  rolActual: 'conductor' | 'pasajero';
  viajesFiltrados: Viaje[] = [];
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
      this.autoUpdateInterval = undefined;
    }
  }

  ionViewWillEnter() {
    this.actualizarDatos();
  }

  ionViewWillLeave() {
    if (this.autoUpdateInterval) {
      clearInterval(this.autoUpdateInterval);
      this.autoUpdateInterval = undefined;
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
    // Limpiar intervalo existente si hay uno
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
      console.log('Cargando viajes con rol:', this.rolActual);
      const subscription = this.viajesService.obtenerViajesPorRol(this.rolActual)
        .pipe(take(1))
        .subscribe({
          next: (viajes) => {
            console.log('Viajes recibidos:', viajes);
            this.viajesFiltrados = viajes;
            
            // Mostrar mensaje solo si no hay viajes y está en estado de carga inicial
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

  async actualizarManualmente() {
    this.isLoading = true;
    try {
      this.viajesService.notificarCambioViajes();
      await this.actualizarDatos(false);
      await this.mostrarMensaje('Viajes actualizados', 'success');
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