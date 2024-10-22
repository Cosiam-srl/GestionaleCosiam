import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportHSEComponent } from './report-hse.component';

describe('ReportHSEComponent', () => {
  let component: ReportHSEComponent;
  let fixture: ComponentFixture<ReportHSEComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportHSEComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportHSEComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
