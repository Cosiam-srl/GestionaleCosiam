import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuppliersCantieriComponent } from './suppliers-cantieri.component';

describe('SuppliersCantieriComponent', () => {
  let component: SuppliersCantieriComponent;
  let fixture: ComponentFixture<SuppliersCantieriComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SuppliersCantieriComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SuppliersCantieriComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
