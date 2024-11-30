import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClimaService {
  private apiKey = 'bb5aee459a7faa8eee35db5abba20f7a';
  private baseUrl = 'https://api.openweathermap.org/data/2.5/weather';

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

  obtenerIconoUrl(iconCode: string): string {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  }
}