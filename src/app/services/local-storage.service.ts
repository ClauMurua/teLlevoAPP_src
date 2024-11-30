import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  constructor() { }

  guardarDatos(clave: string, valor: any): boolean {
    try {
      localStorage.setItem(clave, JSON.stringify(valor));
      return true;
    } catch (e) {
      console.error('Error al guardar en localStorage:', e);
      return false;
    }
  }

  obtenerDatos(clave: string): any {
    try {
      const valor = localStorage.getItem(clave);
      return valor ? JSON.parse(valor) : null;
    } catch (e) {
      console.error('Error al obtener datos de localStorage:', e);
      return null;
    }
  }

  eliminarDatos(clave: string): boolean {
    try {
      localStorage.removeItem(clave);
      return true;
    } catch (e) {
      console.error('Error al eliminar datos de localStorage:', e);
      return false;
    }
  }

  limpiarLocalStorage(): boolean {
    try {
      localStorage.clear();
      return true;
    } catch (e) {
      console.error('Error al limpiar localStorage:', e);
      return false;
    }
  }

  existeDato(clave: string): boolean {
    return localStorage.getItem(clave) !== null;
  }

  obtenerTamañoLocalStorage(): number {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length;
      }
    }
    return total;
  }

  guardarUsuario(usuario: {username: string, email: string, password: string}): boolean {
    try {
      let usuarios = this.obtenerDatos('usuarios') || [];
      
      // Normalizar los datos antes de guardar
      const usuarioNormalizado = {
        username: usuario.username.trim(),
        email: usuario.email.trim(),
        password: usuario.password // La contraseña se mantiene exacta
      };
      
      // Verificar si el usuario ya existe
      const existeUsuario = usuarios.some(
        (u: any) => 
          u.username.toLowerCase() === usuarioNormalizado.username.toLowerCase() || 
          u.email.toLowerCase() === usuarioNormalizado.email.toLowerCase()
      );
      
      if (existeUsuario) {
        console.error('El usuario o email ya existe');
        return false;
      }

      usuarios.push(usuarioNormalizado);
      return this.guardarDatos('usuarios', usuarios);
    } catch (e) {
      console.error('Error al guardar usuario:', e);
      return false;
    }
  }

  validarCredenciales(username: string, password: string): boolean {
    try {
      const usuarios = this.obtenerDatos('usuarios') || [];
      console.log('Intentando validar:', { username, password });
      
      for (let usuario of usuarios) {
        console.log('Comparando con:', usuario);
        
        // Comparación exacta de strings
        if ((usuario.username.trim().toLowerCase() === username.trim().toLowerCase() || 
             usuario.email.trim().toLowerCase() === username.trim().toLowerCase()) && 
             usuario.password === password) {
          console.log('¡Coincidencia encontrada!');
          return true;
        }
      }
      
      console.log('No se encontró coincidencia');
      return false;
    } catch (e) {
      console.error('Error al validar credenciales:', e);
      return false;
    }
  }

  obtenerUsuarioPorUsername(username: string) {
    try {
      const usuarios = this.obtenerDatos('usuarios') || [];
      return usuarios.find((u: any) => 
        u.username.trim().toLowerCase() === username.trim().toLowerCase() || 
        u.email.trim().toLowerCase() === username.trim().toLowerCase()
      ) || null;
    } catch (e) {
      console.error('Error al obtener usuario:', e);
      return null;
    }
  }
}