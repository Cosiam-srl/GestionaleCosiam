import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MezziDashboardComponent } from './mezzi-dashboard.component';

describe('MezziDashboardComponent', () => {
  let component: MezziDashboardComponent;
  let fixture: ComponentFixture<MezziDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MezziDashboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MezziDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
