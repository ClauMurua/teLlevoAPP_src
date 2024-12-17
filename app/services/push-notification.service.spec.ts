import { TestBed } from '@angular/core/testing';
import { OneSignal } from '@awesome-cordova-plugins/onesignal/ngx';
import { Platform } from '@ionic/angular';
import { PushNotificationService } from './push-notification.service';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Viaje } from '../services/viajes.service';

describe('PushNotificationService', () => {
  let service: PushNotificationService;
  let oneSignalSpy: jasmine.SpyObj<OneSignal>;
  let platformSpy: jasmine.SpyObj<Platform>;

  // Mock de un viaje válido basado en la interfaz correcta
  const mockViaje: Viaje = {
    id: '123',
    puntoPartida: 'Origen',
    destino: 'Destino',
    fecha: new Date().toISOString(),
    horaSalida: '14:30',
    asientosDisponibles: 4,
    costoViaje: 5000,
    conductorUsername: 'conductor-test',
    pasajeros: [],
    clima: {
      temperatura: 20,
      descripcion: 'Soleado'
    }
  };

  beforeEach(() => {
    oneSignalSpy = jasmine.createSpyObj('OneSignal', [
      'startInit',
      'endInit',
      'inFocusDisplaying',
      'handleNotificationReceived',
      'handleNotificationOpened',
      'getIds'
    ]);

    // Configurar el objeto OSInFocusDisplayOption completo
    oneSignalSpy.OSInFocusDisplayOption = {
      None: 0,
      InAppAlert: 1,
      Notification: 2
    };

    platformSpy = jasmine.createSpyObj('Platform', ['is']);

    // Configurar los valores de retorno
    oneSignalSpy.startInit.and.returnValue(oneSignalSpy);
    oneSignalSpy.endInit.and.returnValue(oneSignalSpy);
    oneSignalSpy.inFocusDisplaying.and.returnValue(oneSignalSpy);
    oneSignalSpy.handleNotificationReceived.and.returnValue(new Observable());
    oneSignalSpy.handleNotificationOpened.and.returnValue(new Observable());
    oneSignalSpy.getIds.and.returnValue(Promise.resolve({
      userId: 'test-user-id',
      pushToken: 'test-push-token'
    }));

    platformSpy.is.and.returnValue(true);

    TestBed.configureTestingModule({
      providers: [
        PushNotificationService,
        { provide: OneSignal, useValue: oneSignalSpy },
        { provide: Platform, useValue: platformSpy }
      ]
    });

    service = TestBed.inject(PushNotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('debería inicializar OneSignal en plataforma cordova', () => {
    service.inicializarOneSignal();
    
    expect(platformSpy.is).toHaveBeenCalledWith('cordova');
    expect(oneSignalSpy.startInit).toHaveBeenCalledWith(
      environment.oneSignal.appId,
      environment.oneSignal.firebaseSenderId
    );
    expect(oneSignalSpy.inFocusDisplaying).toHaveBeenCalled();
    expect(oneSignalSpy.handleNotificationReceived).toHaveBeenCalled();
    expect(oneSignalSpy.handleNotificationOpened).toHaveBeenCalled();
    expect(oneSignalSpy.endInit).toHaveBeenCalled();
  });

  it('no debería inicializar OneSignal fuera de cordova', () => {
    platformSpy.is.and.returnValue(false);
    service.inicializarOneSignal();
    
    expect(platformSpy.is).toHaveBeenCalledWith('cordova');
    expect(oneSignalSpy.startInit).not.toHaveBeenCalled();
  });

  it('debería enviar notificación de viaje seleccionado en cordova', async () => {
    const conductorId = 'test-conductor';

    spyOn(console, 'log');
    await service.enviarNotificacionViajeSeleccionado(conductorId, mockViaje);

    expect(console.log).toHaveBeenCalledWith(
      'Enviando notificación:',
      jasmine.objectContaining({
        app_id: environment.oneSignal.appId,
        include_player_ids: [conductorId],
        data: {
          type: 'viaje_seleccionado',
          viajeId: mockViaje.id
        }
      })
    );
  });

  it('debería enviar notificación de nuevo viaje en cordova', async () => {
    spyOn(console, 'log');
    await service.enviarNotificacionNuevoViaje(mockViaje);

    expect(console.log).toHaveBeenCalledWith(
      'Enviando notificación de nuevo viaje:',
      jasmine.objectContaining({
        app_id: environment.oneSignal.appId,
        included_segments: ['All'],
        data: {
          type: 'nuevo_viaje',
          viajeId: mockViaje.id
        }
      })
    );
  });

  it('debería guardar el userId de OneSignal en localStorage', async () => {
    spyOn(localStorage, 'setItem');
    service.inicializarOneSignal();
    
    // Esperar a que se resuelva la promesa de getIds
    await oneSignalSpy.getIds();
    
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'oneSignalUserId',
      'test-user-id'
    );
  });
});