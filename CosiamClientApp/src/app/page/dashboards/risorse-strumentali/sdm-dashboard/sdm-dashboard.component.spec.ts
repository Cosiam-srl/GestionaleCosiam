import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SdmDashboardComponent } from './sdm-dashboard.component';

describe('SdmDashboardComponent', () => {
  let component: SdmDashboardComponent;
  let fixture: ComponentFixture<SdmDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SdmDashboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SdmDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
