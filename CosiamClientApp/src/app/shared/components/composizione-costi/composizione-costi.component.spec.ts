import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComposizioneCostiComponent } from './composizione-costi.component';

describe('ComposizioneCostiComponent', () => {
  let component: ComposizioneCostiComponent;
  let fixture: ComponentFixture<ComposizioneCostiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComposizioneCostiComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ComposizioneCostiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
