import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { ClimaService, ClimaData } from '../services/clima.service';
import { ViajesService } from '../services/viajes.service';

interface Viaje {
  puntoPartida: string;
  destino: string;
  fecha: Date | null;
  horaSalida: string;
  asientosDisponibles: number;
  costoViaje: number;
  clima?: ClimaData;
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

  climaData: ClimaData | null = null;
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

  ngOnInit() {}

  onDestinoChange() {
    if (this.viaje.destino && this.viaje.destino.length > 2) {
      this.buscarClima();
    }
  }

  buscarClima() {
    this.cargandoClima = true;
    this.errorClima = '';
    this.climaData = null;

    this.climaService.obtenerClimaActual(this.viaje.destino + ',cl').subscribe({
      next: (data) => {
        this.climaData = data;
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
      this.timeControl.value !== null &&
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

    const horaSeleccionada = this.timeControl.value;
    const horaFormateada = `${String(horaSeleccionada).padStart(2, '0')}:00`;
    this.viaje.horaSalida = horaFormateada;

    const viajeCompleto = {
      ...this.viaje,
      fecha: this.formatearFechaCompleta(this.viaje.fecha!, horaFormateada),
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