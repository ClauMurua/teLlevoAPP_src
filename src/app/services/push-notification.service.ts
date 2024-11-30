import { Injectable } from '@angular/core';
import { OneSignal } from '@awesome-cordova-plugins/onesignal/ngx';
import { Platform } from '@ionic/angular';
import { Viaje } from '../services/viajes.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {
  private readonly ONESIGNAL_APP_ID = environment.oneSignal.appId;
  private readonly FIREBASE_SENDER_ID = environment.oneSignal.firebaseSenderId;

  constructor(
    private oneSignal: OneSignal,
    private platform: Platform
  ) {}

  inicializarOneSignal() {
    if (this.platform.is('cordova')) {
      this.oneSignal.startInit(this.ONESIGNAL_APP_ID, this.FIREBASE_SENDER_ID);

      this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.Notification);

      this.oneSignal.handleNotificationReceived().subscribe(data => {
        console.log('Notificación recibida:', data);
        this.handleNotification(data);
      });

      this.oneSignal.handleNotificationOpened().subscribe(data => {
        console.log('Notificación abierta:', data);
        this.handleNotificationOpened(data);
      });

      this.oneSignal.getIds().then(ids => {
        console.log('ID de usuario OneSignal:', ids.userId);
        localStorage.setItem('oneSignalUserId', ids.userId);
      });

      this.oneSignal.endInit();
    }
  }

  private handleNotification(data: any) {
    const notificationType = data.payload.additionalData?.type;
    switch (notificationType) {
      case 'nuevo_viaje':
        // Actualizar lista de viajes disponibles
        break;
      case 'viaje_seleccionado':
        // Actualizar estado del viaje
        break;
      case 'viaje_cancelado':
        // Manejar cancelación
        break;
    }
  }

  private handleNotificationOpened(data: any) {
    const notificationType = data.notification.payload.additionalData?.type;
    const viajeId = data.notification.payload.additionalData?.viajeId;

    switch (notificationType) {
      case 'nuevo_viaje':
        // Navegar a detalles del viaje
        break;
      case 'viaje_seleccionado':
        // Navegar a mis viajes
        break;
    }
  }

  async enviarNotificacionViajeSeleccionado(conductorId: string, viaje: Viaje) {
    if (this.platform.is('cordova')) {
      const notificationData = {
        app_id: this.ONESIGNAL_APP_ID,
        include_player_ids: [conductorId],
        contents: {
          en: "Un pasajero ha seleccionado tu viaje",
          es: "Un pasajero ha seleccionado tu viaje"
        },
        data: {
          type: "viaje_seleccionado",
          viajeId: viaje.id
        }
      };

      // Aquí deberías hacer la llamada a tu backend para enviar la notificación
      console.log('Enviando notificación:', notificationData);
    }
  }

  async enviarNotificacionNuevoViaje(viaje: Viaje) {
    if (this.platform.is('cordova')) {
      const notificationData = {
        app_id: this.ONESIGNAL_APP_ID,
        included_segments: ['All'],
        contents: {
          en: "Nuevo viaje disponible",
          es: "Nuevo viaje disponible"
        },
        data: {
          type: "nuevo_viaje",
          viajeId: viaje.id
        }
      };

      // Aquí deberías hacer la llamada a tu backend para enviar la notificación
      console.log('Enviando notificación de nuevo viaje:', notificationData);
    }
  }
}