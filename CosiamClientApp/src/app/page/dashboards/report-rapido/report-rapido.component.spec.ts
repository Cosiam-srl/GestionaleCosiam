import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportRapidoComponent } from './report-rapido.component';

describe('ReportRapidoComponent', () => {
  let component: ReportRapidoComponent;
  let fixture: ComponentFixture<ReportRapidoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportRapidoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportRapidoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
