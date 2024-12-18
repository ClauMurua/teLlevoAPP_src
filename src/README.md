# TELLEVOAPP - Aplicación de Transporte Colaborativo

## Descripción del Proyecto
TellevoApp es una aplicación móvil desarrollada con Ionic/Angular que busca solucionar el problema de transporte que enfrentan los estudiantes vespertinos al finalizar sus clases alrededor de las 22:30 horas. La aplicación facilita la coordinación entre estudiantes que poseen vehículos y aquellos que necesitan transporte, creando una red de transporte colaborativo dentro de la comunidad estudiantil.

### Problemática
- Escasez de transporte público en horarios nocturnos
- Alto costo de servicios de transporte particular (Uber, taxi)
- Falta de movilización propia
- Ausencia de servicios de transporte institucional

### Solución
La aplicación permite que los estudiantes con vehículos propios puedan ofrecer cupos disponibles a compañeros que necesiten transporte, facilitando una alternativa segura y económica para el retorno a sus hogares.

## Requisitos Previos
- Node.js (versión 16 o superior)
- npm (gestor de paquetes de Node.js)
- Ionic CLI
- Angular CLI
- Android Studio (para compilación Android)

## Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/ClauMurua/teLlevoAPP_src/tree/gh-pages
cd tellevoapp
```

2. Instalar dependencias:
```bash
npm install
```

3. Instalar Ionic CLI globalmente:
```bash
npm install -g @ionic/cli
```

4. Instalar Angular Material:
```bash
ng add @angular/material
```
Utilizamos Angular Material en el calendario.

importamos:

import { MatDatepickerInputEvent } from '@angular/material/datepicker';

y en este codigo lo utilizamos:

onDateChange(event: MatDatepickerInputEvent<Date>) {
    this.viaje.fecha = event.value;
    console.log('Fecha seleccionada:', this.viaje.fecha);
}

5. Iniciar servidor de desarrollo:
```bash
ionic serve
```
6. Utilización de Guards.

dentro del proyecto utilizamos los guards en la versión anterior, en la cual al ingresar como conductor el boton buscar viaje (que corresponde al pasajero esta bloqueado) y al ingresar como pasajero, el boton ofrecer viaje esta bloqueado, pero en esta version para que la experiencia de usuario sea aún mejor, decidimos que al iniciar sesión, como conductor, no aparezca la opción buscar-viaje y al ingresar como pasajero, no aparezca la opción ofrecer-viaje.

codigo:

{
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule),
    canActivate: [AutenticacionGuard]
},
{
    path: 'mis-viajes',
    loadChildren: () => import('./mis-viajes/mis-viajes.module').then(m => m.MisViajesPageModule),
    canActivate: [AutenticacionGuard]
}

7. API

En la pagina ofrecer-viaje, al momento de ingresar un nuevo viaje e introducir la ciudad o localidad que el conductor ofrece se abre una card, la cual indica la temperatura del lugar ocupando los iconos de Ionic.

codigo utilizado.

onDestinoChange() {
    if (this.viaje.destino && this.viaje.destino.length > 2) {
      this.buscarClima();
    }
  }

  buscarClima() {
    this.cargandoClima = true;
    this.errorClima = '';
    this.climaData = null;

    this.climaService.obtenerClimaActual(this.viaje.destino + ',cl').subscribe({
      next: (data) => {
        this.climaData = data;
        this.cargandoClima = false;
      },
      error: (error) => {
        console.error('Error al obtener clima:', error);
        this.errorClima = 'No se pudo obtener la información del clima';
        this.cargandoClima = false;
      }
    });
  }

  onDateChange(event: MatDatepickerInputEvent<Date>) {
    this.viaje.fecha = event.value;
    console.log('Fecha seleccionada:', this.viaje.fecha);
  }

  8. Pluggins

    -8.1 Plugin notificaciones onesignal:
    Este plugin lo utilizamos para que cuando un conductor ingrese correctamente un nuevo viaje, les llega una notificación al teléfono a los demás usuario para que puedan sumarse a su viaje, así mismo el pasajero cuando selecciona y acepta un viaje le llega una notificación al conductor que ofreció el viaje.

    para instalar onesignal:
    -npm install onesignal-cordova-plugin

    para instalar wraper para one signal
    -npm install @awesome-cordova-plugins/onesignal

    -8.2 plugin capacitor-camera
    este plugin permite que el usuario de la aplicación independiente si es conductor o pasajero, en su perfil pueda sacarse una selfie y ponerla como foto de perfil.

    para instalar plugin camara:
    -npm install @capacitor/camera

    sincronizar el proyecto con capacitor
    -npx cap sync

## Tecnologías y APIs Utilizadas
- Ionic 7
- Angular 16
- TypeScript
- SCSS
- Capacitor/camera
- OneSignal
- Firebase
- Angular Material
  - Componentes de Material Design
  - Temas personalizados
  - Datepicker para selección de fechas
  - Diálogos y alertas
- OpenWeatherMap API
  - Integración de datos meteorológicos en tiempo real
  - Pronóstico del tiempo para la planificación de viajes
  - Información de temperatura y condiciones climáticas

## Pruebas (Testing)

El proyecto incluye pruebas unitarias realizadas con Karma y Jasmine. Para ejecutar las pruebas:

ng test

### Resultados de Testing
Se han implementado pruebas para los siguientes componentes:

- Login Page: 
  - Validación de credenciales
  - Manejo de errores
  - Navegación

- Reset Password Page:
  - Validación de formularios
  - Actualización de contraseña
  - Manejo de errores

- Servicios:
  - AutenticacionService
  - ViajesService
  - PushNotificationService
  - ClimaService
    - Peticiones a la API de OpenWeatherMap
    - Manejo de respuestas y errores
    - Transformación de datos meteorológicos

![resultado Karma](image-1.png)

Generación de APK

  - La generación de la APK la realizamos despues de revisar las pruebas con Jazmin Karma y posterior a la creacion de  utlizamos el comando: keytool -genkey -v -keystore my-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias my-key-alias, se debe ingresar la informacion que te solicitan crear un password, el cual utilizaremos mas adelante en la aplicacion Android Studio para crear la APK,se crea un archivo en el proyecto, el cual debemos buscar mas adelante.
   -ionic capacitor build android
  este codigo lleva nuestra aplicacion a Android Studio, en este programa esperamos que cargue nuestra aplicacion y abrimos el menu principal, seleccionamos al Build, pinchamos generated signed app bundle / APK, seleccionamos APK, debemos seleccionar el archivo creado anteriormente llamado my-release-key.jks, se ingresa el password y el alias elegido, despues se pone next, se selecciona release y se espera a que se cree la apk.

## Características Principales
- Registro y autenticación de usuarios
- Creación y búsqueda de viajes
- Sistema de notificaciones push
- Interfaz adaptativa y responsiva
- Gestión de roles (conductor/pasajero)
- Información meteorológica en tiempo real
- Componentes de Material Design
- Formularios reactivos con validación

## Responsabilidades del Equipo

### Claudio Murúa
- Desarrollo del módulo de autenticación
- Integración con servicios de notificaciones
- Implementación del servicio del clima
- Encargado o lider de gitHub


### Nicolás Cárdenas
- Documentación técnica
- Diseño de interfaz de usuario con Angular Material
- Implementación de pruebas unitarias
- Implementación de capacitor-camera

## Build y Despliegue para Android

1. Crear el build de producción:
```bash
ionic build --prod
```

2. Agregar plataforma Android:
```bash
ionic capacitor add android
```

3. Copiar los archivos al proyecto Android:
```bash
ionic capacitor copy android
```

4. Abrir el proyecto en Android Studio:
```bash
ionic capacitor open android
```

5. Generar APK desde Android Studio:
   -Para versión firmada: Build > Generate Signed Bundle / APK

## Variables de Entorno
Para ejecutar este proyecto, necesitarás configurar las siguientes variables de entorno:
- OPENWEATHER_API_KEY: bb5aee459a7faa8eee35db5abba20f7a
- ONESIGNAL_APP_ID: 70620975-b8d1-4abb-9721-b4e3dc06ffab


## Creado por
Nicolas Cardenas
Claudio Murua
