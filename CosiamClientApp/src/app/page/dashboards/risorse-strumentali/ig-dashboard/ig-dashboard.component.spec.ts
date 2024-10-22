import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IgDashboardComponent } from './ig-dashboard.component';

describe('IgDashboardComponent', () => {
  let component: IgDashboardComponent;
  let fixture: ComponentFixture<IgDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IgDashboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IgDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
