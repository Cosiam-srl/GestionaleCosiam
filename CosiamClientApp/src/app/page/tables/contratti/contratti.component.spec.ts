import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContrattiComponent } from './contratti.component';

describe('ContrattiComponent', () => {
  let component: ContrattiComponent;
  let fixture: ComponentFixture<ContrattiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContrattiComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContrattiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
