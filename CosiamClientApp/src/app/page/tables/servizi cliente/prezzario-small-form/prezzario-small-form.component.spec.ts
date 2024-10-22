import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrezzarioSmallFormComponent } from './prezzario-small-form.component';

describe('PrezzarioSmallFormComponent', () => {
  let component: PrezzarioSmallFormComponent;
  let fixture: ComponentFixture<PrezzarioSmallFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrezzarioSmallFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PrezzarioSmallFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
