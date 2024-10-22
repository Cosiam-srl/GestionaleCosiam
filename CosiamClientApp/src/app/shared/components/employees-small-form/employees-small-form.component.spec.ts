import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeesSmallFormComponent } from './employees-small-form.component';

describe('EmployeesSmallFormComponent', () => {
  let component: EmployeesSmallFormComponent;
  let fixture: ComponentFixture<EmployeesSmallFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeesSmallFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeesSmallFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
