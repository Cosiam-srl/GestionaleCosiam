import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BeniEServiziComponent } from './beni-e-servizi.component';

describe('BeniEServiziComponent', () => {
  let component: BeniEServiziComponent;
  let fixture: ComponentFixture<BeniEServiziComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BeniEServiziComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BeniEServiziComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
