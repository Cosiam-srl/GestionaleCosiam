import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FornitoriSmallFormComponent } from './fornitori-small-form.component';

describe('FornitoriSmallFormComponent', () => {
  let component: FornitoriSmallFormComponent;
  let fixture: ComponentFixture<FornitoriSmallFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FornitoriSmallFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FornitoriSmallFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
