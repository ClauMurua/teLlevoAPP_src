import { ComponentFixture, TestBed, fakeAsync, tick, discardPeriodicTasks } from '@angular/core/testing';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { MisViajesPage } from './mis-viajes.page';
import { ViajesService } from '../services/viajes.service';
import { AutenticacionService } from '../autenticacion.service';
import { of, Subject } from 'rxjs';

describe('MisViajesPage', () => {
  let component: MisViajesPage;
  let fixture: ComponentFixture<MisViajesPage>;
  let viajesServiceSpy: jasmine.SpyObj<ViajesService>;
  let authServiceSpy: jasmine.SpyObj<AutenticacionService>;
  let toastControllerSpy: jasmine.SpyObj<ToastController>;
  let alertControllerSpy: jasmine.SpyObj<AlertController>;

  beforeEach(async () => {
    const viajeSpy = jasmine.createSpyObj('ViajesService', [
      'obtenerViajesPorRol',
      'notificarCambioViajes'
    ], {
      viajes$: of([]),
      actualizacion$: new Subject()
    });
    const authSpy = jasmine.createSpyObj('AutenticacionService', ['obtenerUsuario', 'obtenerRol']);
    const toastSpy = jasmine.createSpyObj('ToastController', ['create']);
    const alertSpy = jasmine.createSpyObj('AlertController', ['create']);

    // Configurar spy del toast
    const toastElement = {
      present: jasmine.createSpy('present').and.returnValue(Promise.resolve()),
      dismiss: jasmine.createSpy('dismiss').and.returnValue(Promise.resolve())
    };
    toastSpy.create.and.returnValue(Promise.resolve(toastElement));

    await TestBed.configureTestingModule({
      declarations: [MisViajesPage],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: ViajesService, useValue: viajeSpy },
        { provide: AutenticacionService, useValue: authSpy },
        { provide: ToastController, useValue: toastSpy },
        { provide: AlertController, useValue: alertSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MisViajesPage);
    component = fixture.componentInstance;
    viajesServiceSpy = TestBed.inject(ViajesService) as jasmine.SpyObj<ViajesService>;
    authServiceSpy = TestBed.inject(AutenticacionService) as jasmine.SpyObj<AutenticacionService>;
    toastControllerSpy = TestBed.inject(ToastController) as jasmine.SpyObj<ToastController>;
    alertControllerSpy = TestBed.inject(AlertController) as jasmine.SpyObj<AlertController>;

    // Configuraciones iniciales
    authSpy.obtenerUsuario.and.returnValue('testUser');
    authSpy.obtenerRol.and.returnValue('conductor');
    viajeSpy.obtenerViajesPorRol.and.returnValue(of([]));
  });

  it('debería mostrar mensaje cuando no hay viajes', fakeAsync(() => {
    // Configurar el estado inicial
    component.isLoading = true;
    viajesServiceSpy.obtenerViajesPorRol.and.returnValue(of([]));
    
    // Iniciar el componente
    component.ngOnInit();
    tick();
    
    // Forzar la carga de viajes
    component.cargarViajes();
    tick();
    
    // Verificar que se llamó a create y present
    expect(toastControllerSpy.create).toHaveBeenCalled();
    discardPeriodicTasks();
  }));
});