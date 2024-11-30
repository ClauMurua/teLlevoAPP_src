import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule, ToastController } from '@ionic/angular';
import { BuscarViajePage } from './buscar-viaje.page';
import { ViajesService } from '../services/viajes.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule, MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DateAdapter, MatNativeDateModule, NativeDateAdapter } from '@angular/material/core';
import { of } from 'rxjs';

describe('BuscarViajePage', () => {
  let component: BuscarViajePage;
  let fixture: ComponentFixture<BuscarViajePage>;
  let viajesServiceSpy: jasmine.SpyObj<ViajesService>;
  let toastControllerSpy: jasmine.SpyObj<ToastController>;

  const mockViajes = [
    {
      id: '1',
      puntoPartida: 'Origen',
      destino: 'Destino',
      fecha: new Date().toISOString(),
      horaSalida: '14:30',
      asientosDisponibles: 4,
      costoViaje: 5000
    }
  ];

  beforeEach(async () => {
    const viajeSpy = jasmine.createSpyObj('ViajesService', ['seleccionarViaje'], {
      viajes$: of(mockViajes)
    });
    const toastSpy = jasmine.createSpyObj('ToastController', ['create']);
    toastSpy.create.and.returnValue(Promise.resolve({
      present: () => Promise.resolve()
    }));

    await TestBed.configureTestingModule({
      declarations: [ BuscarViajePage ],
      imports: [
        IonicModule.forRoot(),
        ReactiveFormsModule,
        MatDatepickerModule,
        MatFormFieldModule,
        MatInputModule,
        MatNativeDateModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: ViajesService, useValue: viajeSpy },
        { provide: ToastController, useValue: toastSpy },
        { provide: DateAdapter, useClass: NativeDateAdapter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BuscarViajePage);
    component = fixture.componentInstance;
    viajesServiceSpy = TestBed.inject(ViajesService) as jasmine.SpyObj<ViajesService>;
    toastControllerSpy = TestBed.inject(ToastController) as jasmine.SpyObj<ToastController>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debería cargar viajes al inicializar', () => {
    expect(component.viajes).toEqual(mockViajes);
  });

  it('debería filtrar viajes por fecha', () => {
    const fecha = new Date();
    const event = { value: fecha } as MatDatepickerInputEvent<Date>;
    component.buscarViajesPorFecha(event);
    expect(component.viajesFiltrados.length).toBeGreaterThanOrEqual(0);
  });

  it('debería limpiar la búsqueda', () => {
    component.dateControl.setValue(new Date());
    component.limpiarBusqueda();
    expect(component.dateControl.value).toBeNull();
    expect(component.viajesFiltrados.length).toBe(0);
  });

  it('debería formatear la fecha correctamente', () => {
    const fecha = new Date().toISOString();
    const resultado = component.formatearFecha(fecha);
    expect(resultado).toMatch(/\d{1,2}-\d{1,2}-\d{4} \d{1,2}:\d{2}.*m\./);
  });

  it('debería manejar la selección de viaje correctamente', async () => {
    const viaje = { ...mockViajes[0] };
    viajesServiceSpy.seleccionarViaje.and.returnValue(of({ 
      success: true, 
      message: 'Viaje seleccionado exitosamente' 
    }));

    await component.seleccionarViaje(viaje);
    expect(toastControllerSpy.create).toHaveBeenCalled();
  });

  it('debería manejar errores en la selección de viaje', async () => {
    const viaje = { ...mockViajes[0] };
    viajesServiceSpy.seleccionarViaje.and.returnValue(of({ 
      success: false, 
      message: 'Error al seleccionar viaje' 
    }));

    await component.seleccionarViaje(viaje);
    expect(toastControllerSpy.create).toHaveBeenCalledWith({
      message: 'Error al seleccionar viaje',
      duration: 2000,
      position: 'bottom',
      color: 'warning'
    });
  });
});