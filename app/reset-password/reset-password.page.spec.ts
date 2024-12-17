import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResetPasswordPage } from './reset-password.page';
import { IonicModule, AlertController, NavController, AlertButton } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AutenticacionService } from '../autenticacion.service';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Location } from '@angular/common';

describe('ResetPasswordPage', () => {
  let component: ResetPasswordPage;
  let fixture: ComponentFixture<ResetPasswordPage>;
  let alertControllerSpy: jasmine.SpyObj<AlertController>;
  let routerSpy: jasmine.SpyObj<Router>;
  let authServiceSpy: jasmine.SpyObj<AutenticacionService>;
  let navControllerSpy: jasmine.SpyObj<NavController>;
  let locationSpy: jasmine.SpyObj<Location>;

  const mockAlert = {
    present: jasmine.createSpy('present'),
    onDidDismiss: jasmine.createSpy('onDidDismiss'),
    animated: true,
    backdropDismiss: true,
    keyboardClose: true,
    buttons: [],
    inputs: [],
    cssClass: '',
    id: '',
    message: '',
    header: '',
    subHeader: '',
    translucent: false,
    enterAnimation: undefined,
    leaveAnimation: undefined,
    addEventListener: jasmine.createSpy('addEventListener'),
    removeEventListener: jasmine.createSpy('removeEventListener'),
    componentOnReady: jasmine.createSpy('componentOnReady'),
    dismiss: jasmine.createSpy('dismiss'),
    setAttribute: jasmine.createSpy('setAttribute'),
    style: {}
  } as any;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    alertControllerSpy = jasmine.createSpyObj('AlertController', ['create']);
    authServiceSpy = jasmine.createSpyObj('AutenticacionService', ['verificarUsuarioExiste', 'actualizarContraseña']);
    navControllerSpy = jasmine.createSpyObj('NavController', ['navigateRoot']);
    locationSpy = jasmine.createSpyObj('Location', ['back']);

    mockAlert.present.and.returnValue(Promise.resolve());
    mockAlert.onDidDismiss.and.returnValue(Promise.resolve());
    alertControllerSpy.create.and.returnValue(Promise.resolve(mockAlert));

    await TestBed.configureTestingModule({
      declarations: [ResetPasswordPage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [
        IonicModule.forRoot(),
        FormsModule
      ],
      providers: [
        { provide: AlertController, useValue: alertControllerSpy },
        { provide: Router, useValue: routerSpy },
        { provide: AutenticacionService, useValue: authServiceSpy },
        { provide: NavController, useValue: navControllerSpy },
        { provide: Location, useValue: locationSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ResetPasswordPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debería mostrar error cuando el username está vacío', async () => {
    component.username = '';
    component.newPassword = 'password123';
    
    await component.resetPassword();
    
    expect(alertControllerSpy.create).toHaveBeenCalledWith({
      header: 'Error de validación',
      message: 'Por favor verifica que:\n- El usuario no esté vacío\n- La contraseña tenga al menos 6 caracteres',
      buttons: ['OK'],
      cssClass: 'custom-alert'
    });
  });

  it('debería mostrar error cuando la contraseña es muy corta', async () => {
    component.username = 'testuser';
    component.newPassword = '12345';
    
    await component.resetPassword();
    
    expect(alertControllerSpy.create).toHaveBeenCalledWith({
      header: 'Error de validación',
      message: 'Por favor verifica que:\n- El usuario no esté vacío\n- La contraseña tenga al menos 6 caracteres',
      buttons: ['OK'],
      cssClass: 'custom-alert'
    });
  });

  it('debería mostrar error cuando el usuario no existe', async () => {
    component.username = 'usernoexiste';
    component.newPassword = 'password123';
    authServiceSpy.verificarUsuarioExiste.and.returnValue(false);
    
    await component.resetPassword();
    
    expect(authServiceSpy.verificarUsuarioExiste).toHaveBeenCalledWith('usernoexiste');
    expect(alertControllerSpy.create).toHaveBeenCalledWith({
      header: 'Usuario no encontrado',
      message: 'El usuario ingresado no existe en el sistema.',
      buttons: ['OK'],
      cssClass: 'custom-alert'
    });
  });

  it('debería actualizar la contraseña exitosamente', async () => {
    component.username = 'testuser';
    component.newPassword = 'newpassword123';
    authServiceSpy.verificarUsuarioExiste.and.returnValue(true);
    authServiceSpy.actualizarContraseña.and.returnValue(true);
    
    await component.resetPassword();
    
    expect(authServiceSpy.actualizarContraseña).toHaveBeenCalledWith('testuser', 'newpassword123');
    expect(alertControllerSpy.create).toHaveBeenCalledWith({
      header: 'Éxito',
      message: 'La contraseña se ha restablecido correctamente.',
      buttons: ['OK'],
      cssClass: 'custom-alert'
    });
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('debería mostrar error cuando falla la actualización', async () => {
    component.username = 'testuser';
    component.newPassword = 'newpassword123';
    authServiceSpy.verificarUsuarioExiste.and.returnValue(true);
    authServiceSpy.actualizarContraseña.and.returnValue(false);
    
    await component.resetPassword();
    
    expect(alertControllerSpy.create).toHaveBeenCalledWith({
      header: 'Error',
      message: 'No se pudo actualizar la contraseña. Por favor intente nuevamente.',
      buttons: ['OK'],
      cssClass: 'custom-alert'
    });
  });

  it('debería validar username correctamente', () => {
    expect(component['isValidUsername']('testuser')).toBeTrue();
    expect(component['isValidUsername']('')).toBeFalse();
    expect(component['isValidUsername']('   ')).toBeFalse();
  });

  it('debería validar password correctamente', () => {
    expect(component['isValidPassword']('password123')).toBeTrue();
    expect(component['isValidPassword']('12345')).toBeFalse();
    expect(component['isValidPassword']('')).toBeFalse();
  });

  it('debería navegar al login', () => {
    routerSpy.navigate(['/login']);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });
});