import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DpiDashboardComponent } from './dpi-dashboard.component';

describe('DpiDashboardComponent', () => {
  let component: DpiDashboardComponent;
  let fixture: ComponentFixture<DpiDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DpiDashboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DpiDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
