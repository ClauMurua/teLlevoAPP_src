import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ClimaPage } from './clima.page';
import { ClimaService } from '../services/clima.service';

describe('ClimaPage', () => {
  let component: ClimaPage;
  let fixture: ComponentFixture<ClimaPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClimaPage ],
      imports: [ HttpClientTestingModule ],
      providers: [ ClimaService ]
    }).compileComponents();

    fixture = TestBed.createComponent(ClimaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});