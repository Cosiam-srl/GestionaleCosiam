import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StrumentiDiMisuraTableComponent } from './strumenti-di-misura-table.component';

describe('StrumentiDiMisuraTableComponent', () => {
  let component: StrumentiDiMisuraTableComponent;
  let fixture: ComponentFixture<StrumentiDiMisuraTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StrumentiDiMisuraTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StrumentiDiMisuraTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
