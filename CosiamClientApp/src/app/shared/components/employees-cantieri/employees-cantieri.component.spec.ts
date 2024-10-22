import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeesCantieriComponent } from './employees-cantieri.component';

describe('EmployeesCantieriComponent', () => {
  let component: EmployeesCantieriComponent;
  let fixture: ComponentFixture<EmployeesCantieriComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeesCantieriComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeesCantieriComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
