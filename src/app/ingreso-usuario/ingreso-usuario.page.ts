import { Component, Renderer2 } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AutenticacionService } from '../autenticacion.service';

@Component({
  selector: 'app-ingreso-usuario',
  templateUrl: './ingreso-usuario.page.html',
  styleUrls: ['./ingreso-usuario.page.scss'],
})
export class IngresoUsuarioPage {
  username: string = '';
  email: string = '';
  password: string = '';

  constructor(
    private alertCtrl: AlertController,
    private navCtrl: NavController,
    private router: Router,
    private renderer: Renderer2,
    private autenticacionService: AutenticacionService
  ) {}

  async registrarYRedirigir() {
    if (this.isValidInputs()) {
      const registroExitoso = this.autenticacionService.registrarUsuario({
        username: this.username.trim(),
        email: this.email.trim(),
        password: this.password.trim()
      });

      if (registroExitoso) {
        await this.mostrarMensajeIngresoExitoso();
        // Redirige directamente al login después del registro exitoso
        await this.router.navigate(['/login']);
      } else {
        await this.mostrarErrorUsuarioExistente();
      }
    } else {
      await this.mostrarErrorDatosInvalidos();
    }
  }

  private async mostrarMensajeIngresoExitoso() {
    const alert = await this.alertCtrl.create({
      header: 'Éxito',
      message: 'Te has registrado correctamente en el sistema. Puedes iniciar sesión ahora.',
      buttons: [
        {
          text: 'OK',
          role: 'confirm',
          cssClass: 'custom-alert-button'
        }
      ],
      cssClass: 'custom-alert-wrapper'
    });

    await alert.present();

    // Estilos personalizados para la alerta de éxito
    const alertWrapper = document.querySelector('.alert-wrapper') as HTMLElement;
    const alertHeader = document.querySelector('.alert-head h2') as HTMLElement;
    const alertMessage = document.querySelector('.alert-message') as HTMLElement;

    if (alertWrapper && alertHeader && alertMessage) {
      this.renderer.setStyle(alertWrapper, 'background-color', 'rgba(255, 255, 255, 0.9)');
      this.renderer.setStyle(alertWrapper, 'border-radius', '15px');
      this.renderer.setStyle(alertWrapper, 'box-shadow', '0 8px 32px rgba(0, 0, 0, 0.3)');
      this.renderer.setStyle(alertHeader, 'color', '#182848');
      this.renderer.setStyle(alertHeader, 'font-weight', 'bold');
      this.renderer.setStyle(alertMessage, 'color', '#4b6cb7');
      this.renderer.setStyle(alertMessage, 'font-size', '16px');
    }
  }

  private async mostrarErrorDatosInvalidos() {
    const alert = await this.alertCtrl.create({
      header: 'Error de Validación',
      message: 'Por favor verifica que todos los campos estén completos y sean válidos.',
      buttons: ['OK']
    });
    await alert.present();
  }

  private async mostrarErrorUsuarioExistente() {
    const alert = await this.alertCtrl.create({
      header: 'Usuario Existente',
      message: 'El nombre de usuario o email ya está registrado en el sistema.',
      buttons: ['OK']
    });
    await alert.present();
  }

  private isValidInputs(): boolean {
    return this.isValidUsername(this.username) && 
           this.isValidEmail(this.email) && 
           this.isValidPassword(this.password);
  }

  private isValidUsername(username: string): boolean {
    const trimmedUsername = username.trim();
    return trimmedUsername.length >= 3 && trimmedUsername.length <= 20;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }

  private isValidPassword(password: string): boolean {
    const trimmedPassword = password.trim();
    return trimmedPassword.length >= 6;
  }
}
