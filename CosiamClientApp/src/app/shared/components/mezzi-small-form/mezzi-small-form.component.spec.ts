import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MezziSmallFormComponent } from './mezzi-small-form.component';

describe('MezziSmallFormComponent', () => {
  let component: MezziSmallFormComponent;
  let fixture: ComponentFixture<MezziSmallFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MezziSmallFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MezziSmallFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
