import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditUserDashboardComponent } from './edit-user-dashboard.component';

describe('EditUserDashboardComponent', () => {
  let component: EditUserDashboardComponent;
  let fixture: ComponentFixture<EditUserDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditUserDashboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditUserDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
