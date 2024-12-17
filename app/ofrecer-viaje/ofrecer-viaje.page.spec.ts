import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { OfrecerViajePage } from './ofrecer-viaje.page';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { ClimaService } from '../services/clima.service';
import { ViajesService } from '../services/viajes.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule, MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { of, throwError } from 'rxjs';

describe('OfrecerViajePage', () => {
  let component: OfrecerViajePage;
  let fixture: ComponentFixture<OfrecerViajePage>;
  let climaServiceSpy: jasmine.SpyObj<ClimaService>;
  let viajesServiceSpy: jasmine.SpyObj<ViajesService>;
  let router: Router;

  const mockClimaData = {
    temperatura: 20,
    descripcion: 'cielo despejado',
    iconName: 'sunny-outline'
  };

  beforeEach(async () => {
    const climaSpy = jasmine.createSpyObj('ClimaService', ['obtenerClimaActual']);
    const viajesSpy = jasmine.createSpyObj('ViajesService', ['agregarViaje']);

    climaSpy.obtenerClimaActual.and.returnValue(of(mockClimaData));

    await TestBed.configureTestingModule({
      declarations: [ OfrecerViajePage ],
      imports: [
        IonicModule.forRoot(),
        RouterTestingModule,
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
        MatDatepickerModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatNativeDateModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: ClimaService, useValue: climaSpy },
        { provide: ViajesService, useValue: viajesSpy },
        { provide: MAT_DATE_LOCALE, useValue: 'es-CL' },
        { 
          provide: MAT_DATE_FORMATS, 
          useValue: {
            parse: {
              dateInput: 'DD/MM/YYYY',
            },
            display: {
              dateInput: 'DD/MM/YYYY',
              monthYearLabel: 'MMM YYYY',
              dateA11yLabel: 'LL',
              monthYearA11yLabel: 'MMMM YYYY',
            },
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OfrecerViajePage);
    component = fixture.componentInstance;
    climaServiceSpy = TestBed.inject(ClimaService) as jasmine.SpyObj<ClimaService>;
    viajesServiceSpy = TestBed.inject(ViajesService) as jasmine.SpyObj<ViajesService>;
    router = TestBed.inject(Router);
    
    const dateAdapter = TestBed.inject(DateAdapter);
    dateAdapter.setLocale('es-CL');
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debería inicializar con valores por defecto', () => {
    expect(component.viaje.puntoPartida).toBe('DuocUc');
    expect(component.viaje.asientosDisponibles).toBe(1);
    expect(component.viaje.costoViaje).toBe(500);
  });

  it('debería buscar el clima cuando cambia el destino', () => {
    component.viaje.destino = 'Puerto Montt';
    component.onDestinoChange();
    expect(climaServiceSpy.obtenerClimaActual).toHaveBeenCalledWith('Puerto Montt,cl');
  });

  it('debería actualizar climaData cuando la búsqueda es exitosa', () => {
    component.viaje.destino = 'Puerto Montt';
    component.buscarClima();

    expect(component.climaData).toEqual(mockClimaData);
    expect(component.cargandoClima).toBeFalse();
    expect(component.errorClima).toBe('');
  });

  it('debería manejar errores en la búsqueda del clima', () => {
    climaServiceSpy.obtenerClimaActual.and.returnValue(throwError(() => new Error('Error de red')));
    component.viaje.destino = 'Ciudad Inexistente';
    component.buscarClima();

    expect(component.errorClima).toBe('No se pudo obtener la información del clima');
    expect(component.cargandoClima).toBeFalse();
    expect(component.climaData).toBeNull();
  });

  it('debería actualizar la fecha cuando se selecciona', () => {
    const fecha = new Date();
    const event = { value: fecha } as MatDatepickerInputEvent<Date>;
    component.onDateChange(event);
    expect(component.viaje.fecha).toBe(fecha);
  });

  it('debería validar correctamente un viaje completo', () => {
    component.viaje = {
      puntoPartida: 'DuocUc',
      destino: 'Puerto Montt',
      fecha: new Date(),
      horaSalida: '14:00',
      asientosDisponibles: 2,
      costoViaje: 1000
    };
    component.timeControl.setValue('14:00');

    expect(component.isValidViaje()).toBeTrue();
  });

  it('debería invalidar un viaje incompleto', () => {
    component.viaje = {
      puntoPartida: 'DuocUc',
      destino: '',
      fecha: null,
      horaSalida: '',
      asientosDisponibles: 0,
      costoViaje: 0
    };
    component.timeControl.setValue('');

    expect(component.isValidViaje()).toBeFalse();
  });

  it('debería programar un viaje válido', () => {
    const fecha = new Date();
    component.viaje = {
      puntoPartida: 'DuocUc',
      destino: 'Puerto Montt',
      fecha: fecha,
      horaSalida: '14:00',
      asientosDisponibles: 2,
      costoViaje: 1000
    };
    component.timeControl.setValue('14:00');
    component.climaData = mockClimaData;

    spyOn(window, 'alert');
    spyOn(router, 'navigate');

    component.programarViaje();

    expect(viajesServiceSpy.agregarViaje).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('Viaje programado con éxito');
    expect(router.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('debería navegar a home al cancelar', () => {
    spyOn(router, 'navigate');
    component.cancelar();
    expect(router.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('debería tener horas disponibles válidas', () => {
    expect(component.availableHours.length).toBe(24);
    expect(component.availableHours[0].display).toBe('00:00');
    expect(component.availableHours[23].display).toBe('23:00');
  });
});