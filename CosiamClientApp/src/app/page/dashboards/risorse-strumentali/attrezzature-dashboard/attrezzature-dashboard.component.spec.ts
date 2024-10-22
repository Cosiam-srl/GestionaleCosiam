import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttrezzatureDashboardComponent } from './attrezzature-dashboard.component';

describe('AttrezzatureDashboardComponent', () => {
  let component: AttrezzatureDashboardComponent;
  let fixture: ComponentFixture<AttrezzatureDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AttrezzatureDashboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AttrezzatureDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
