import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { NavController } from '@ionic/angular';
import { AutenticacionService } from '../autenticacion.service';

@Component({
  selector: 'app-no-encontrado',
  templateUrl: './no-encontrado.page.html',
  styleUrls: ['./no-encontrado.page.scss'],
})
export class NoEncontradoPage {
  constructor(
    private location: Location,
    private navCtrl: NavController,
    private authService: AutenticacionService
  ) {}

  volver() {
    if (this.authService.estaLogueado()) {
      this.navCtrl.navigateBack('/home');
    } else {
      this.navCtrl.navigateBack('/login');
    }
  }
}