import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AutenticacionService } from '../autenticacion.service';

@Injectable({
  providedIn: 'root'
})
export class AutenticacionGuard implements CanActivate {
  constructor(
    private authService: AutenticacionService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    // Verificar autenticación básica
    if (!this.authService.estaLogueado()) {
      this.router.navigate(['/login']);
      return false;
    }

    // Verificar roles si se especifican en la ruta
    const requiredRole = route.data['role'] as 'conductor' | 'pasajero' | undefined;
    
    if (requiredRole) {
      const userRole = this.authService.obtenerRol();
      
      if (requiredRole === 'conductor' && !this.authService.esConductor()) {
        this.router.navigate(['/home']);
        return false;
      }
      
      if (requiredRole === 'pasajero' && !this.authService.esPasajero()) {
        this.router.navigate(['/home']);
        return false;
      }
    }

    return true;
  }
}