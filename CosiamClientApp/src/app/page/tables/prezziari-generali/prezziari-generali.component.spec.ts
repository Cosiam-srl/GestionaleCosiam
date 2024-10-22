import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrezziariGeneraliComponent } from './prezziari-generali.component';

describe('PrezziariGeneraliComponent', () => {
  let component: PrezziariGeneraliComponent;
  let fixture: ComponentFixture<PrezziariGeneraliComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrezziariGeneraliComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrezziariGeneraliComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
