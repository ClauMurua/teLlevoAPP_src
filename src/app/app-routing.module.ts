import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AutenticacionGuard } from './guards/autenticacion.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule)
  },
  {
    path: 'reset-password',
    loadChildren: () => import('./reset-password/reset-password.module').then(m => m.ResetPasswordPageModule)
  },
  {
    path: 'ingreso-usuario',
    loadChildren: () => import('./ingreso-usuario/ingreso-usuario.module').then(m => m.IngresoUsuarioPageModule)
  },
  {
    path: 'ofrecer-viaje',
    loadChildren: () => import('./ofrecer-viaje/ofrecer-viaje.module').then(m => m.OfrecerViajePageModule),
    canActivate: [AutenticacionGuard],
    data: { role: 'conductor' }  // Añadido el rol requerido
  },
  {
    path: 'buscar-viaje',
    loadChildren: () => import('./buscar-viaje/buscar-viaje.module').then(m => m.BuscarViajePageModule),
    canActivate: [AutenticacionGuard],
    data: { role: 'pasajero' }  // Añadido el rol requerido
  },
  {
    path: 'mis-viajes',
    loadChildren: () => import('./mis-viajes/mis-viajes.module').then(m => m.MisViajesPageModule),
    canActivate: [AutenticacionGuard]  // No tiene rol específico, accesible para ambos
  },
  {
    path: 'clima',
    loadChildren: () => import('./clima/clima.module').then(m => m.ClimaPageModule)
  },
  {
    path: '**',
    loadChildren: () => import('./no-encontrado/no-encontrado.module').then(m => m.NoEncontradoPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }