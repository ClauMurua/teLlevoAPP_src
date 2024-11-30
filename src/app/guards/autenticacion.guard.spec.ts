import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { AutenticacionGuard } from './autenticacion.guard';
import { AutenticacionService } from '../autenticacion.service';

describe('AutenticacionGuard', () => {
  let guard: AutenticacionGuard;
  let authService: jasmine.SpyObj<AutenticacionService>;
  let router: Router;
  let route: ActivatedRouteSnapshot;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('AutenticacionService', [
      'estaLogueado',
      'obtenerRol',
      'esConductor',
      'esPasajero'
    ]);

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        AutenticacionGuard,
        { provide: AutenticacionService, useValue: spy }
      ]
    });

    guard = TestBed.inject(AutenticacionGuard);
    authService = TestBed.inject(AutenticacionService) as jasmine.SpyObj<AutenticacionService>;
    router = TestBed.inject(Router);
    route = new ActivatedRouteSnapshot();
    route.data = {}; // Inicializar data vacío
    spyOn(router, 'navigate');
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  describe('Autenticación básica', () => {
    it('debería redirigir a login si el usuario no está autenticado', () => {
      authService.estaLogueado.and.returnValue(false);
      
      const result = guard.canActivate(route);
      
      expect(result).toBeFalse();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
      expect(authService.estaLogueado).toHaveBeenCalled();
    });

    it('debería permitir acceso si el usuario está autenticado y no hay rol requerido', () => {
      authService.estaLogueado.and.returnValue(true);
      route.data = {};
      
      const result = guard.canActivate(route);
      
      expect(result).toBeTrue();
      expect(router.navigate).not.toHaveBeenCalled();
    });
  });

  describe('Verificación de rol conductor', () => {
    beforeEach(() => {
      authService.estaLogueado.and.returnValue(true);
      route.data = { role: 'conductor' };
    });

    it('debería permitir acceso si el usuario es conductor', () => {
      authService.esConductor.and.returnValue(true);
      
      const result = guard.canActivate(route);
      
      expect(result).toBeTrue();
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('debería redirigir a home si el usuario no es conductor', () => {
      authService.esConductor.and.returnValue(false);
      
      const result = guard.canActivate(route);
      
      expect(result).toBeFalse();
      expect(router.navigate).toHaveBeenCalledWith(['/home']);
    });
  });

  describe('Verificación de rol pasajero', () => {
    beforeEach(() => {
      authService.estaLogueado.and.returnValue(true);
      route.data = { role: 'pasajero' };
    });

    it('debería permitir acceso si el usuario es pasajero', () => {
      authService.esPasajero.and.returnValue(true);
      
      const result = guard.canActivate(route);
      
      expect(result).toBeTrue();
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('debería redirigir a home si el usuario no es pasajero', () => {
      authService.esPasajero.and.returnValue(false);
      
      const result = guard.canActivate(route);
      
      expect(result).toBeFalse();
      expect(router.navigate).toHaveBeenCalledWith(['/home']);
    });
  });

  describe('Manejo de roles desde el servicio', () => {
    beforeEach(() => {
      authService.estaLogueado.and.returnValue(true);
    });

    it('debería verificar el rol del usuario cuando se requiere', () => {
      route.data = { role: 'conductor' };
      authService.obtenerRol.and.returnValue('conductor');
      authService.esConductor.and.returnValue(true);
      
      const result = guard.canActivate(route);
      
      expect(result).toBeTrue();
      expect(authService.obtenerRol).toHaveBeenCalled();
    });
  });
});