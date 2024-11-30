import { Component, Renderer2 } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AutenticacionService } from '../autenticacion.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
})
export class ResetPasswordPage {
  username: string = '';
  newPassword: string = '';

  constructor(
    private alertCtrl: AlertController,
    private navCtrl: NavController,
    private router: Router,
    private renderer: Renderer2,
    private authService: AutenticacionService
  ) {}

  async resetPassword() {
    if (!this.isValidUsername(this.username) || !this.isValidPassword(this.newPassword)) {
      await this.mostrarErrorValidacion();
      return;
    }

    // Verificar si el usuario existe
    if (!this.authService.verificarUsuarioExiste(this.username)) {
      await this.mostrarError('Usuario no encontrado', 'El usuario ingresado no existe en el sistema.');
      return;
    }

    // Intentar actualizar la contraseña
    const actualizado = this.authService.actualizarContraseña(this.username, this.newPassword);
    
    if (actualizado) {
      await this.mostrarMensajeReseteoExitoso();
      this.router.navigate(['/login']);
    } else {
      await this.mostrarError('Error', 'No se pudo actualizar la contraseña. Por favor intente nuevamente.');
    }
  }

  private async mostrarMensajeReseteoExitoso() {
    const alert = await this.alertCtrl.create({
      header: 'Éxito',
      message: 'La contraseña se ha restablecido correctamente.',
      buttons: ['OK'],
      cssClass: 'custom-alert'
    });

    await alert.present();
  }

  private async mostrarErrorValidacion() {
    const alert = await this.alertCtrl.create({
      header: 'Error de validación',
      message: 'Por favor verifica que:\n- El usuario no esté vacío\n- La contraseña tenga al menos 6 caracteres',
      buttons: ['OK'],
      cssClass: 'custom-alert'
    });
    await alert.present();
  }

  private async mostrarError(titulo: string, mensaje: string) {
    const alert = await this.alertCtrl.create({
      header: titulo,
      message: mensaje,
      buttons: ['OK'],
      cssClass: 'custom-alert'
    });
    await alert.present();
  }

  private isValidUsername(username: string): boolean {
    return username.trim().length > 0;
  }

  private isValidPassword(password: string): boolean {
    return password.trim().length >= 6;
  }
}