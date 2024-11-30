import { Component } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AutenticacionService } from '../autenticacion.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  username: string = '';
  password: string = '';
  selectedRole: 'conductor' | 'pasajero' = '' as 'conductor' | 'pasajero';

  constructor(
    private navCtrl: NavController,
    private router: Router,
    private alertController: AlertController,
    private authService: AutenticacionService
  ) {
    this.verificarSesionActiva();
  }

  private async verificarSesionActiva() {
    if (this.authService.estaLogueado()) {
      this.navCtrl.navigateRoot('/home');
    }
  }

  async navegarHome() {
    if (!this.selectedRole) {
      await this.mostrarAlerta('Error', 'Por favor seleccione un modo (conductor o pasajero)');
      return;
    }

    if (this.username.trim() && this.password.trim()) {
      if (this.authService.iniciarSesion(this.username.trim(), this.password.trim(), this.selectedRole)) {
        await this.navCtrl.navigateRoot('/home');
      } else {
        await this.mostrarAlerta('Error', 'Usuario o contraseña incorrectos');
        this.password = '';
      }
    } else {
      await this.mostrarAlerta('Error', 'Por favor complete todos los campos');
    }
  }

  private async mostrarAlerta(titulo: string, mensaje: string) {
    const alert = await this.alertController.create({
      header: titulo,
      message: mensaje,
      buttons: ['OK']
    });
    await alert.present();
  }
}