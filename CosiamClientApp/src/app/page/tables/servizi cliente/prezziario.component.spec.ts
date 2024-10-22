import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrezziarioComponent } from './prezziario.component';

describe('PrezziarioComponent', () => {
  let component: PrezziarioComponent;
  let fixture: ComponentFixture<PrezziarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrezziarioComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrezziarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
