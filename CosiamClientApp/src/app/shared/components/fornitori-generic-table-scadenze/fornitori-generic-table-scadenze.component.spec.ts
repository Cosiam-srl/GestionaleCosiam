import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FornitoriGenericTableScadenzeComponent } from './fornitori-generic-table-scadenze.component';

describe('FornitoriGenericTableScadenzeComponent', () => {
  let component: FornitoriGenericTableScadenzeComponent;
  let fixture: ComponentFixture<FornitoriGenericTableScadenzeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FornitoriGenericTableScadenzeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FornitoriGenericTableScadenzeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
