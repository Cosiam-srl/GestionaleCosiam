import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoteDiCantiereComponent } from './note-di-cantiere.component';

describe('NoteDiCantiereComponent', () => {
  let component: NoteDiCantiereComponent;
  let fixture: ComponentFixture<NoteDiCantiereComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NoteDiCantiereComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NoteDiCantiereComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
