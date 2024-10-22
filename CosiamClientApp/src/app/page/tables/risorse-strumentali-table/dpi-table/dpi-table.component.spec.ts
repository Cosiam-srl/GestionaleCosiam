import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DpiTableComponent } from './dpi-table.component';

describe('DpiTableComponent', () => {
  let component: DpiTableComponent;
  let fixture: ComponentFixture<DpiTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DpiTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DpiTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
