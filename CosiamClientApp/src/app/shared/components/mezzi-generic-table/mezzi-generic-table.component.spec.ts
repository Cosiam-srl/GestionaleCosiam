import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MezziGenericTableComponent } from './mezzi-generic-table.component';

describe('MezziGenericTableComponent', () => {
  let component: MezziGenericTableComponent;
  let fixture: ComponentFixture<MezziGenericTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MezziGenericTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MezziGenericTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
