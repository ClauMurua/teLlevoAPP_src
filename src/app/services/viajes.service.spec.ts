import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ViajesService } from './viajes.service';
import { AutenticacionService } from '../autenticacion.service';
import { PushNotificationService } from './push-notification.service';
import { Platform } from '@ionic/angular';
import { OneSignal } from '@awesome-cordova-plugins/onesignal/ngx';

describe('ViajesService', () => {
  let service: ViajesService;
  let authServiceSpy: jasmine.SpyObj<AutenticacionService>;
  let pushServiceSpy: jasmine.SpyObj<PushNotificationService>;
  let platformSpy: jasmine.SpyObj<Platform>;
  let oneSignalSpy: jasmine.SpyObj<OneSignal>;
  let mockLocalStorage: { [key: string]: string } = {};

  beforeEach(() => {
    // Limpiar el localStorage mock
    mockLocalStorage = {};

    // Configurar spies
    authServiceSpy = jasmine.createSpyObj('AutenticacionService', ['obtenerUsuario']);
    pushServiceSpy = jasmine.createSpyObj('PushNotificationService', ['enviarNotificacionNuevoViaje']);
    platformSpy = jasmine.createSpyObj('Platform', ['is']);
    oneSignalSpy = jasmine.createSpyObj('OneSignal', [
      'startInit',
      'endInit',
      'getIds',
      'handleNotificationReceived',
      'handleNotificationOpened',
      'inFocusDisplaying'
    ]);

    // Configurar localStorage mock
    spyOn(localStorage, 'getItem').and.callFake(key => mockLocalStorage[key]);
    spyOn(localStorage, 'setItem').and.callFake((key, value) => mockLocalStorage[key] = value);
    
    // Configurar console.error spy
    spyOn(console, 'error').and.callThrough();

    TestBed.configureTestingModule({
      providers: [
        ViajesService,
        { provide: AutenticacionService, useValue: authServiceSpy },
        { provide: PushNotificationService, useValue: pushServiceSpy },
        { provide: Platform, useValue: platformSpy },
        { provide: OneSignal, useValue: oneSignalSpy }
      ]
    });

    authServiceSpy.obtenerUsuario.and.returnValue('testUser');
    platformSpy.is.and.returnValue(true);
  });

  it('debería cargar viajes desde localStorage al iniciar', (done) => {
    const mockViajes = [{
      id: '1',
      puntoPartida: 'DuocUc',
      destino: 'Puerto Montt',
      fecha: new Date().toISOString(),
      horaSalida: '14:00',
      asientosDisponibles: 4,
      costoViaje: 5000,
      conductorUsername: 'testUser'
    }];

    // Guardar en localStorage antes de inicializar el servicio
    mockLocalStorage['viajes'] = JSON.stringify(mockViajes);
    
    service = TestBed.inject(ViajesService);

    // Suscribirse a los viajes después de inicializar el servicio
    service.viajes$.subscribe(viajes => {
      expect(viajes).toEqual(mockViajes);
      done();
    });
  });

  it('debería manejar error al cargar viajes inválidos', (done) => {
    // Establecer JSON inválido antes de inicializar el servicio
    mockLocalStorage['viajes'] = 'invalid json';
    
    service = TestBed.inject(ViajesService);
    
    service.viajes$.subscribe(() => {
      expect(console.error).toHaveBeenCalled();
      done();
    });
  });
});