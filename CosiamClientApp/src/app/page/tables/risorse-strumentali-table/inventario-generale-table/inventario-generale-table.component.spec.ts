import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventarioGeneraleTableComponent } from './inventario-generale-table.component';

describe('InventarioGeneraleTableComponent', () => {
  let component: InventarioGeneraleTableComponent;
  let fixture: ComponentFixture<InventarioGeneraleTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InventarioGeneraleTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InventarioGeneraleTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
