import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RisorseStrumentaliComponent } from './risorse-strumentali.component';

describe('RisorseStrumentaliComponent', () => {
  let component: RisorseStrumentaliComponent;
  let fixture: ComponentFixture<RisorseStrumentaliComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RisorseStrumentaliComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RisorseStrumentaliComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
