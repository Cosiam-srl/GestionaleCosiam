import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DettaglioSalFattureComponent } from './dettaglio-sal-fatture.component';

describe('DettaglioSalFattureComponent', () => {
  let component: DettaglioSalFattureComponent;
  let fixture: ComponentFixture<DettaglioSalFattureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DettaglioSalFattureComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DettaglioSalFattureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
