import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientiDashboardComponent } from './clienti-dashboard.component';

describe('ClientiDashboardComponent', () => {
  let component: ClientiDashboardComponent;
  let fixture: ComponentFixture<ClientiDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClientiDashboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientiDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
