import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { AutenticacionService } from '../autenticacion.service';
import { PushNotificationService } from '../services/push-notification.service';
import { map } from 'rxjs/operators';

export interface Viaje {
  id?: string;
  puntoPartida: string;
  destino: string;
  fecha: string;
  horaSalida: string;
  asientosDisponibles: number;
  costoViaje: number;
  conductorUsername?: string;
  pasajeros?: string[];
  clima?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ViajesService {
  private viajesSubject = new BehaviorSubject<Viaje[]>([]);
  private actualizacionSubject = new Subject<void>();
  
  viajes$ = this.viajesSubject.asObservable();
  actualizacion$ = this.actualizacionSubject.asObservable();

  constructor(
    private authService: AutenticacionService,
    private pushService: PushNotificationService
  ) {
    this.cargarViajes();
    // Configurar actualizaciones periódicas
    this.configurarActualizacionesPeriodicas();
  }

  private configurarActualizacionesPeriodicas() {
    // Actualizar cada 30 segundos
    setInterval(() => {
      this.cargarViajes();
    }, 30000);
  }

  private cargarViajes() {
    try {
      const viajesString = localStorage.getItem('viajes');
      if (viajesString) {
        const viajes = JSON.parse(viajesString);
        this.viajesSubject.next(viajes);
        this.actualizacionSubject.next();
        console.log('Viajes cargados del localStorage:', viajes);
      }
    } catch (error) {
      console.error('Error al cargar viajes:', error);
      this.viajesSubject.next([]);
    }
  }

  private guardarViajes(viajes: Viaje[]) {
    try {
      localStorage.setItem('viajes', JSON.stringify(viajes));
      this.viajesSubject.next(viajes);
      this.actualizacionSubject.next();
      console.log('Viajes guardados en localStorage:', viajes);
    } catch (error) {
      console.error('Error al guardar viajes:', error);
    }
  }

  notificarCambioViajes() {
    this.actualizacionSubject.next();
  }

  agregarViaje(viaje: Viaje): void {
    const usuario = this.authService.obtenerUsuario();
    if (!usuario) {
      throw new Error('Usuario no autenticado');
    }

    const nuevoViaje: Viaje = {
      ...viaje,
      id: this.generateId(),
      conductorUsername: usuario,
      pasajeros: []
    };

    const viajesActuales = this.viajesSubject.value;
    this.guardarViajes([...viajesActuales, nuevoViaje]);

    this.pushService.enviarNotificacionNuevoViaje(nuevoViaje);
  }

  seleccionarViaje(viajeId: string): Observable<{success: boolean, message: string}> {
    return new Observable(observer => {
      try {
        const usuario = this.authService.obtenerUsuario();
        if (!usuario) {
          observer.error(new Error('Usuario no autenticado'));
          return;
        }

        const viajes = this.viajesSubject.value;
        const viajeIndex = viajes.findIndex(v => v.id === viajeId);
        
        if (viajeIndex === -1) {
          observer.next({ success: false, message: 'Viaje no encontrado' });
          observer.complete();
          return;
        }

        const viaje = viajes[viajeIndex];
        
        // Validaciones
        if (viaje.pasajeros?.includes(usuario)) {
          observer.next({ success: false, message: 'Ya has seleccionado un asiento en este viaje' });
          observer.complete();
          return;
        }
        
        if (viaje.asientosDisponibles <= 0) {
          observer.next({ success: false, message: 'No hay asientos disponibles' });
          observer.complete();
          return;
        }
        
        if (viaje.conductorUsername === usuario) {
          observer.next({ success: false, message: 'No puedes seleccionar tu propio viaje' });
          observer.complete();
          return;
        }

        const viajeActualizado = {
          ...viaje,
          asientosDisponibles: viaje.asientosDisponibles - 1,
          pasajeros: [...(viaje.pasajeros || []), usuario]
        };

        const nuevosViajes = [...viajes];
        nuevosViajes[viajeIndex] = viajeActualizado;
        
        this.guardarViajes(nuevosViajes);
        
        if (viajeActualizado.conductorUsername) {
          this.pushService.enviarNotificacionViajeSeleccionado(
            viajeActualizado.conductorUsername,
            viajeActualizado
          );
        }

        observer.next({ success: true, message: 'Viaje seleccionado exitosamente' });
        observer.complete();
      } catch (error) {
        console.error('Error en seleccionarViaje:', error);
        observer.error(error);
      }
    });
  }

  obtenerViajesPorRol(rol: 'conductor' | 'pasajero'): Observable<Viaje[]> {
    const usuario = this.authService.obtenerUsuario();
    if (!usuario) {
      throw new Error('Usuario no autenticado');
    }

    return this.viajes$.pipe(
      map(viajes => viajes.filter(viaje => {
        if (rol === 'conductor') {
          return viaje.conductorUsername === usuario;
        } else {
          return Array.isArray(viaje.pasajeros) && viaje.pasajeros.includes(usuario);
        }
      }))
    );
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}