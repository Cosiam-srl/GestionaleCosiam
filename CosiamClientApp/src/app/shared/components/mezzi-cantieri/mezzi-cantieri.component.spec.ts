import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MezziCantieriComponent } from './mezzi-cantieri.component';

describe('MezziCantieriComponent', () => {
  let component: MezziCantieriComponent;
  let fixture: ComponentFixture<MezziCantieriComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MezziCantieriComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MezziCantieriComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
