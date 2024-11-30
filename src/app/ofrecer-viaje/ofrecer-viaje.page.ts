import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { ClimaService } from '../services/clima.service';
import { ViajesService } from '../services/viajes.service';

interface ClimaData {
  main: {
    temp: number;
    humidity: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
  };
  weather: [{
    description: string;
    icon: string;
  }];
  wind: {
    speed: number;
  };
  name: string;
}

interface ClimaDataTransformed {
  icono: string;
  temperatura: number;
  descripcion: string;
}

interface Viaje {
  puntoPartida: string;
  destino: string;
  fecha: Date | null;
  horaSalida: string;
  asientosDisponibles: number;
  costoViaje: number;
  clima?: ClimaDataTransformed;
}

@Component({
  selector: 'app-ofrecer-viaje',
  templateUrl: './ofrecer-viaje.page.html',
  styleUrls: ['./ofrecer-viaje.page.scss']
})
export class OfrecerViajePage implements OnInit {
  viaje: Viaje = {
    puntoPartida: 'DuocUc',
    destino: '',
    fecha: null,
    horaSalida: '',
    asientosDisponibles: 1,
    costoViaje: 500
  };

  climaData: ClimaDataTransformed | null = null;
  errorClima: string = '';
  cargandoClima: boolean = false;
  minDate = new Date();
  timeControl = new FormControl('');

  availableHours = Array.from({length: 24}, (_, i) => ({
    value: i,
    display: `${String(i).padStart(2, '0')}:00`
  }));

  constructor(
    private router: Router,
    private climaService: ClimaService,
    private viajesService: ViajesService
  ) {}

  ngOnInit() {
    // Inicialización si es necesaria
  }

  onDestinoChange() {
    console.log('Destino cambiado:', this.viaje.destino);
    if (this.viaje.destino && this.viaje.destino.length > 2) {
      this.buscarClima();
    }
  }

  buscarClima() {
    this.cargandoClima = true;
    this.errorClima = '';
    this.climaData = null;

    this.climaService.obtenerClimaActual(this.viaje.destino + ',cl').subscribe({
      next: (data: ClimaData) => {
        this.climaData = {
          icono: `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
          temperatura: Math.round(data.main.temp),
          descripcion: data.weather[0].description,
        };
        this.cargandoClima = false;
      },
      error: (error) => {
        console.error('Error al obtener clima:', error);
        this.errorClima = 'No se pudo obtener la información del clima';
        this.cargandoClima = false;
      }
    });
  }

  onDateChange(event: MatDatepickerInputEvent<Date>) {
    this.viaje.fecha = event.value;
    console.log('Fecha seleccionada:', this.viaje.fecha);
  }

  isValidViaje(): boolean {
    const isValid = !!(
      this.viaje.destino &&
      this.viaje.fecha &&
      this.timeControl.value &&
      this.viaje.asientosDisponibles &&
      this.viaje.costoViaje >= 500
    );
    return isValid;
  }

  programarViaje() {
    if (!this.isValidViaje()) {
      console.log('Viaje inválido, no se puede programar');
      return;
    }

    const viajeCompleto = {
      ...this.viaje,
      fecha: this.formatearFechaCompleta(this.viaje.fecha!, this.timeControl.value!),
      clima: this.climaData
    };

    try {
      this.viajesService.agregarViaje(viajeCompleto);
      alert('Viaje programado con éxito');
      this.router.navigate(['/home']);
    } catch (error) {
      console.error('Error al guardar el viaje:', error);
      alert('Error al guardar el viaje. Por favor, intente nuevamente.');
    }
  }

  private formatearFechaCompleta(fecha: Date, hora: string): string {
    try {
      const fechaBase = new Date(fecha);
      const [horaStr] = hora.split(':');
      fechaBase.setHours(parseInt(horaStr), 0, 0, 0);
      return fechaBase.toISOString();
    } catch (error) {
      console.error('Error al formatear la fecha:', error);
      return new Date().toISOString();
    }
  }

  cancelar() {
    this.router.navigate(['/home']);
  }
}