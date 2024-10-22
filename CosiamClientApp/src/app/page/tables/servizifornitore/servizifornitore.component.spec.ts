import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServizifornitoreComponent } from './servizifornitore.component';

describe('ServizifornitoreComponent', () => {
  let component: ServizifornitoreComponent;
  let fixture: ComponentFixture<ServizifornitoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServizifornitoreComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ServizifornitoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
