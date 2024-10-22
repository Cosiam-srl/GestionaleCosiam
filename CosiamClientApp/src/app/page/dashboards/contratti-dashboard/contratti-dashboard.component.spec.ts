import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContrattiDashboardComponent } from './contratti-dashboard.component';

describe('ContrattiDashboardComponent', () => {
  let component: ContrattiDashboardComponent;
  let fixture: ComponentFixture<ContrattiDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContrattiDashboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContrattiDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
