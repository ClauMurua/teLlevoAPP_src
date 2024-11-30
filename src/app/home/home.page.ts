import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { AutenticacionService } from '../autenticacion.service';
import { AlertController, ToastController } from '@ionic/angular';
import { LocalStorageService } from '../services/local-storage.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  logueado: boolean = false;
  username: string = '';
  private authStateSubscription: Subscription | null = null;

  constructor(
    private router: Router,
    private navCtrl: NavController,
    public authService: AutenticacionService,
    private alertController: AlertController,
    private toastController: ToastController,
    private localStorage: LocalStorageService
  ) {}

  ngOnInit() {
    this.verificarSesionActiva();
    this.authStateSubscription = this.authService.getAuthState().subscribe((authState) => {
      this.logueado = authState?.isAuthenticated || false;
      this.username = authState?.username || '';
    });
  }

  ngOnDestroy() {
    if (this.authStateSubscription) {
      this.authStateSubscription.unsubscribe();
    }
  }

  verificarSesionActiva() {
    this.logueado = this.authService.estaLogueado();
    if (this.logueado) {
      this.username = this.authService.obtenerUsuario() || '';
    }
  }

  ionViewWillEnter() {
    this.verificarSesionActiva();
  }

  async manejarSesion() {
    if (this.logueado) {
      await this.cerrarSesion();
    } else {
      this.router.navigate(['/login']);
    }
  }

  async cerrarSesion() {
    const alert = await this.alertController.create({
      cssClass: 'custom-alert',
      header: 'Confirmar',
      message: '¿Está seguro que desea cerrar sesión?',
      buttons: [
        {
          text: 'No',
          cssClass: 'alert-button-cancel',
          role: 'cancelar',
          handler: () => {
            console.log('Cierre de sesión cancelado');
          }
        },
        {
          text: 'Sí',
          cssClass: 'alert-button-confirm',
          handler: () => {
            this.authService.cerrarSesion();
            this.logueado = false;
            this.localStorage.eliminarDatos('sesion_activa');
            this.localStorage.eliminarDatos('userRole');
            this.router.navigate(['/login']);
          }
        }
      ]
    });
    await alert.present();
  }

  async mostrarMensajeSinSesion() {
    const alert = await this.alertController.create({
      header: 'Acceso Limitado',
      message: 'Para acceder a las funciones, debe iniciar sesión',
      buttons: [
        {
          text: 'Iniciar Sesión',
          handler: () => {
            this.router.navigate(['/login']);
          }
        },
        {
          text: 'Continuar sin sesión',
          role: 'cancel'
        }
      ]
    });
    await alert.present();
  }

  async ofrecerViaje() {
    if (this.logueado) {
      if (this.authService.obtenerRol() === 'pasajero') {
        await this.mostrarToast('No tienes permisos de conductor');
        return;
      }
      this.localStorage.guardarDatos('userRole', 'conductor');
      await this.mostrarToastRol('conductor');
      this.navCtrl.navigateForward('/ofrecer-viaje');
    } else {
      this.mostrarMensajeSinSesion();
    }
  }

  async buscarViaje() {
    if (this.logueado) {
      if (this.authService.obtenerRol() === 'conductor') {
        await this.mostrarToast('No tienes permisos de pasajero');
        return;
      }
      this.localStorage.guardarDatos('userRole', 'pasajero');
      await this.mostrarToastRol('pasajero');
      this.navCtrl.navigateForward('/buscar-viaje');
    } else {
      this.mostrarMensajeSinSesion();
    }
  }

  async verMisViajes() {
    if (this.logueado) {
      const rolGuardado = this.localStorage.obtenerDatos('userRole');
      if (!rolGuardado) {
        await this.seleccionarRol();
      } else {
        this.navCtrl.navigateForward('/mis-viajes');
      }
    } else {
      this.mostrarMensajeSinSesion();
    }
  }

  private async seleccionarRol() {
    const alert = await this.alertController.create({
      header: 'Seleccionar Vista',
      message: '¿Cómo deseas ver tus viajes?',
      buttons: [
        {
          text: 'Como Conductor',
          handler: () => {
            this.localStorage.guardarDatos('userRole', 'conductor');
            this.navCtrl.navigateForward('/mis-viajes');
          }
        },
        {
          text: 'Como Pasajero',
          handler: () => {
            this.localStorage.guardarDatos('userRole', 'pasajero');
            this.navCtrl.navigateForward('/mis-viajes');
          }
        }
      ]
    });
    await alert.present();
  }

  private async mostrarToast(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      position: 'bottom',
      color: 'danger'
    });
    await toast.present();
  }

  private async mostrarToastRol(rol: string) {
    const toast = await this.toastController.create({
      message: `Modo ${rol} activado`,
      duration: 2000,
      position: 'bottom'
    });
    await toast.present();
  }
}