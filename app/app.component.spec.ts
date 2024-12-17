import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { OneSignal } from '@awesome-cordova-plugins/onesignal/ngx';
import { PushNotificationService } from './services/push-notification.service';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      providers: [
        PushNotificationService,
        {
          provide: OneSignal,
          useValue: {
            startInit: () => Promise.resolve(),
            endInit: () => Promise.resolve(),
            getIds: () => Promise.resolve({ userId: 'test' }),
            sendTag: () => Promise.resolve()
          }
        }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});