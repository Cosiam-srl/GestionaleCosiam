import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BeniEServiziSmallFormComponent } from './beni-e-servizi-small-form.component';

describe('BeniEServiziSmallFormComponent', () => {
  let component: BeniEServiziSmallFormComponent;
  let fixture: ComponentFixture<BeniEServiziSmallFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BeniEServiziSmallFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BeniEServiziSmallFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
