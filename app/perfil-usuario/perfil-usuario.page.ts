// perfil-usuario.page.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { AlertController, LoadingController } from '@ionic/angular';
import { AutenticacionService, AuthState } from '../autenticacion.service';

@Component({
  selector: 'app-perfil-usuario',
  templateUrl: './perfil-usuario.page.html',
  styleUrls: ['./perfil-usuario.page.scss'],
})
export class PerfilUsuarioPage implements OnInit {
  profileForm: FormGroup;
  photoUrl: string | undefined;
  authState: AuthState | null = null;

  constructor(
    private fb: FormBuilder,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private authService: AutenticacionService
  ) {
    this.profileForm = this.fb.group({
      username: [{value: '', disabled: true}], // Deshabilitado porque es de solo lectura
      email: [{value: '', disabled: true}],    // Deshabilitado porque es de solo lectura
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.minLength(6)]],
      confirmPassword: ['']
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit() {
    this.cargarDatosUsuario();
    this.authService.getAuthState().subscribe(state => {
      this.authState = state;
    });
  }

  cargarDatosUsuario() {
    const username = this.authService.obtenerUsuario();
    const email = this.authService.obtenerEmail();
    const rol = this.authService.obtenerRol();

    if (username && email) {
      this.profileForm.patchValue({
        username: username,
        email: email
      });
    }
  }

  async actualizarContrasena() {
    if (this.profileForm.valid && this.authState?.username) {
      const loading = await this.loadingController.create({
        message: 'Actualizando contraseña...'
      });
      await loading.present();

      try {
        const currentPassword = this.profileForm.get('currentPassword')?.value;
        const newPassword = this.profileForm.get('newPassword')?.value;
        
        // Primero verificamos que la contraseña actual sea correcta
        const loginCheck = this.authService.iniciarSesion(
          this.authState.username, 
          currentPassword,
          this.authState.currentRole || 'pasajero'
        );

        if (!loginCheck) {
          await loading.dismiss();
          this.mostrarAlerta('Error', 'La contraseña actual es incorrecta');
          return;
        }

        // Si la contraseña actual es correcta, actualizamos
        const actualizacionExitosa = this.authService.actualizarContraseña(
          this.authState.username,
          newPassword
        );

        await loading.dismiss();

        if (actualizacionExitosa) {
          await this.mostrarAlerta('Éxito', 'Contraseña actualizada correctamente. Por favor, inicie sesión nuevamente.');
          this.authService.cerrarSesion();
        } else {
          this.mostrarAlerta('Error', 'No se pudo actualizar la contraseña');
        }
      } catch (error) {
        await loading.dismiss();
        this.mostrarAlerta('Error', 'Ocurrió un error al actualizar la contraseña');
      }
    }
  }

  async tomarFoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt
      });

      this.photoUrl = image.dataUrl;
    } catch (error) {
      console.error('Error al tomar la foto:', error);
    }
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : {'mismatch': true};
  }

  async mostrarAlerta(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });

    await alert.present();
  }
}