import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BudgetCantiereComponent } from './budget-cantiere.component';

describe('BudgetCantiereComponent', () => {
  let component: BudgetCantiereComponent;
  let fixture: ComponentFixture<BudgetCantiereComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BudgetCantiereComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BudgetCantiereComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
