import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CantieriComponent } from './cantieri.component';

describe('CantieriComponent', () => {
  let component: CantieriComponent;
  let fixture: ComponentFixture<CantieriComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CantieriComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CantieriComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
