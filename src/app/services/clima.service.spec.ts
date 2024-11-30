import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ClimaService } from './clima.service';

describe('ClimaService', () => {
  let service: ClimaService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ClimaService]
    });

    service = TestBed.inject(ClimaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('debería obtener el clima actual para Puerto Montt por defecto', () => {
    const mockClima = {
      main: { temp: 15 },
      weather: [{ description: 'nublado', icon: '04d' }]
    };

    service.obtenerClimaActual().subscribe(data => {
      expect(data).toEqual(mockClima);
    });

    const req = httpMock.expectOne(
      'https://api.openweathermap.org/data/2.5/weather?q=Puerto Montt,cl&appid=bb5aee459a7faa8eee35db5abba20f7a&units=metric&lang=es'
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockClima);
  });

  it('debería obtener el clima actual para una ciudad específica', () => {
    const mockClima = {
      main: { temp: 20 },
      weather: [{ description: 'soleado', icon: '01d' }]
    };
    const ciudad = 'Santiago,cl';

    service.obtenerClimaActual(ciudad).subscribe(data => {
      expect(data).toEqual(mockClima);
    });

    const req = httpMock.expectOne(
      `https://api.openweathermap.org/data/2.5/weather?q=${ciudad}&appid=bb5aee459a7faa8eee35db5abba20f7a&units=metric&lang=es`
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockClima);
  });

  it('debería manejar errores en la petición del clima', (done) => {
    const errorMessage = 'Error al obtener datos del clima';

    service.obtenerClimaActual().subscribe({
      error: (error) => {
        expect(error).toBe(errorMessage);
        done();
      }
    });

    const req = httpMock.expectOne(
      'https://api.openweathermap.org/data/2.5/weather?q=Puerto Montt,cl&appid=bb5aee459a7faa8eee35db5abba20f7a&units=metric&lang=es'
    );
    req.error(new ErrorEvent('Network error'));
  });

  it('debería generar la URL correcta del ícono', () => {
    const iconCode = '04d';
    const expectedUrl = 'https://openweathermap.org/img/wn/04d@2x.png';
    
    expect(service.obtenerIconoUrl(iconCode)).toBe(expectedUrl);
  });
});