import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { ToastController } from '@ionic/angular';
import { ViajesService, Viaje } from '../services/viajes.service';
import { firstValueFrom, Subscription, BehaviorSubject } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'app-buscar-viaje',
  templateUrl: './buscar-viaje.page.html',
  styleUrls: ['./buscar-viaje.page.scss']
})
export class BuscarViajePage implements OnInit, OnDestroy {
  dateControl = new FormControl();
  viajes: Viaje[] = [];
  viajesFiltrados: Viaje[] = [];
  private subscriptions: Subscription[] = [];
  private refreshTrigger = new BehaviorSubject<void>(undefined);

  constructor(
    private toastController: ToastController,
    private viajesService: ViajesService
  ) {}

  ngOnInit() {
    // Configurar actualización en tiempo real
    const viajesSub = this.refreshTrigger.pipe(
      switchMap(() => this.viajesService.viajes$),
      tap(viajes => {
        this.viajes = viajes;
        if (this.dateControl.value) {
          this.aplicarFiltroFecha(this.dateControl.value);
        }
      })
    ).subscribe();

    this.subscriptions.push(viajesSub);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private aplicarFiltroFecha(fecha: Date) {
    const fechaSeleccionada = new Date(fecha);
    fechaSeleccionada.setHours(0, 0, 0, 0);
    
    this.viajesFiltrados = this.viajes.filter(viaje => {
      const fechaViaje = new Date(viaje.fecha);
      fechaViaje.setHours(0, 0, 0, 0);
      return fechaViaje.getTime() === fechaSeleccionada.getTime();
    });
  }

  buscarViajesPorFecha(event: MatDatepickerInputEvent<Date>) {
    if (!event.value) return;
    this.aplicarFiltroFecha(event.value);
  }

  async seleccionarViaje(viaje: Viaje) {
    try {
      const response = await firstValueFrom(this.viajesService.seleccionarViaje(viaje.id!));
      
      if (response.success) {
        // Forzar actualización de datos
        this.refreshTrigger.next();
        
        // Mostrar mensaje de éxito
        await this.mostrarMensaje(response.message, 'success');
        
        // Emitir evento para actualizar mis-viajes
        this.viajesService.notificarCambioViajes();
      } else {
        await this.mostrarMensaje(response.message, 'warning');
      }
    } catch (error) {
      console.error('Error al seleccionar el viaje:', error);
      await this.mostrarMensaje('Error al seleccionar el viaje', 'warning');
    }
  }

  async mostrarMensaje(mensaje: string, tipo: 'success' | 'warning' = 'success') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      position: 'bottom',
      color: tipo === 'success' ? 'success' : 'warning'
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

  limpiarBusqueda() {
    this.dateControl.reset();
    this.viajesFiltrados = [];
  }
}