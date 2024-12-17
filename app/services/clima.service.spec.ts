import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClimaService {
  private apiKey = 'bb5aee459a7faa8eee35db5abba20f7a';
  private baseUrl = 'https://api.openweathermap.org/data/2.5/weather';
  private iconBaseUrl = 'https://openweathermap.org/img/wn';

  private iconMap: { [key: string]: string } = {
    '01d': 'sunny',
    '01n': 'moon',
    '02d': 'partly-sunny',
    '02n': 'cloudy-night',
    '03d': 'cloudy',
    '03n': 'cloudy',
    '04d': 'cloudy',
    '04n': 'cloudy',
    '09d': 'rainy',
    '09n': 'rainy',
    '10d': 'rainy',
    '10n': 'rainy',
    '11d': 'thunderstorm',
    '11n': 'thunderstorm',
    '13d': 'snow',
    '13n': 'snow',
    '50d': 'cloud',
    '50n': 'cloud'
  };

  constructor(private http: HttpClient) { }

  obtenerClimaActual(ciudad: string = 'Puerto Montt,cl'): Observable<any> {
    console.log('Realizando petición al API del clima para:', ciudad);
    const url = `${this.baseUrl}?q=${ciudad}&appid=${this.apiKey}&units=metric&lang=es`;
    
    return this.http.get(url).pipe(
      catchError(error => {
        console.error('Error en la petición del clima:', error);
        throw 'Error al obtener datos del clima';
      })
    );
  }

  obtenerIconoClase(iconCode: string): string {
    return this.iconMap[iconCode] || 'sunny';
  }

  obtenerIconoUrl(iconCode: string): string {
    return `${this.iconBaseUrl}/${iconCode}@2x.png`;
  }
}