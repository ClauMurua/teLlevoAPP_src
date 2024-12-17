import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Usuario {
  username: string;
  email: string;
  password: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  username: string;
  email: string;
  timestamp: string;
  currentRole: 'conductor' | 'pasajero' | null;
}

@Injectable({
  providedIn: 'root'
})
export class AutenticacionService {
  private readonly AUTH_KEY = 'auth_state';
  private readonly USERS_KEY = 'registered_users';
  private authStateSubject: BehaviorSubject<AuthState | null>;

  constructor(private router: Router) {
    const initialState = this.getStoredAuthState();
    this.authStateSubject = new BehaviorSubject<AuthState | null>(initialState);
  }

  private getStoredAuthState(): AuthState | null {
    const stored = localStorage.getItem(this.AUTH_KEY);
    return stored ? JSON.parse(stored) : null;
  }

  private getRegisteredUsers(): Usuario[] {
    const stored = localStorage.getItem(this.USERS_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  registrarUsuario(usuario: Usuario): boolean {
    const usuarios = this.getRegisteredUsers();
    
    if (usuarios.some(u => u.username === usuario.username || u.email === usuario.email)) {
      return false;
    }

    const nuevoUsuario: Usuario = {
      username: usuario.username.trim(),
      email: usuario.email.trim(),
      password: usuario.password.trim()
    };

    usuarios.push(nuevoUsuario);
    localStorage.setItem(this.USERS_KEY, JSON.stringify(usuarios));
    return true;
  }

  iniciarSesion(identificador: string, password: string, rol: 'conductor' | 'pasajero'): boolean {
    const usuarios = this.getRegisteredUsers();
    const usuario = usuarios.find(u => 
      (u.username === identificador || u.email === identificador) && 
      u.password === password
    );
    
    if (usuario) {
      const authState: AuthState = {
        isAuthenticated: true,
        username: usuario.username,
        email: usuario.email,
        timestamp: new Date().toISOString(),
        currentRole: rol
      };

      localStorage.setItem(this.AUTH_KEY, JSON.stringify(authState));
      this.authStateSubject.next(authState);
      return true;
    }
    return false;
  }

  cerrarSesion(): void {
    localStorage.removeItem(this.AUTH_KEY);
    this.authStateSubject.next(null);
    this.router.navigate(['/login']);
  }

  estaLogueado(): boolean {
    const authState = this.getStoredAuthState();
    return authState?.isAuthenticated ?? false;
  }

  obtenerUsuario(): string | null {
    const authState = this.getStoredAuthState();
    return authState?.username ?? null;
  }

  obtenerEmail(): string | null {
    const authState = this.getStoredAuthState();
    return authState?.email ?? null;
  }

  obtenerRol(): 'conductor' | 'pasajero' | null {
    const authState = this.getStoredAuthState();
    return authState?.currentRole ?? null;
  }

  esConductor(): boolean {
    return this.obtenerRol() === 'conductor';
  }

  esPasajero(): boolean {
    return this.obtenerRol() === 'pasajero';
  }

  getAuthState(): Observable<AuthState | null> {
    return this.authStateSubject.asObservable();
  }

  actualizarContraseña(username: string, newPassword: string): boolean {
    const usuarios = this.getRegisteredUsers();
    const index = usuarios.findIndex(u => 
      u.username.toLowerCase() === username.toLowerCase() || 
      u.email.toLowerCase() === username.toLowerCase()
    );
    
    if (index !== -1) {
      usuarios[index].password = newPassword;
      localStorage.setItem(this.USERS_KEY, JSON.stringify(usuarios));
      
      const currentAuth = this.getStoredAuthState();
      if (currentAuth && (currentAuth.username.toLowerCase() === username.toLowerCase() || 
          currentAuth.email.toLowerCase() === username.toLowerCase())) {
        this.cerrarSesion();
      }
      
      return true;
    }
    return false;
  }

  verificarUsuarioExiste(username: string): boolean {
    const usuarios = this.getRegisteredUsers();
    return usuarios.some(u => 
      u.username.toLowerCase() === username.toLowerCase() || 
      u.email.toLowerCase() === username.toLowerCase()
    );
  }

  }