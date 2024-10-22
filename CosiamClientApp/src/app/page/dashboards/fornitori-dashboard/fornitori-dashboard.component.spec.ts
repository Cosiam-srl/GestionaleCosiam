import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FornitoriDashboardComponent } from './fornitori-dashboard.component';

describe('FornitoriDashboardComponent', () => {
  let component: FornitoriDashboardComponent;
  let fixture: ComponentFixture<FornitoriDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FornitoriDashboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FornitoriDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
