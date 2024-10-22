import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonaleDashboardComponent } from './personale-dashboard.component';

describe('PersonaleDashboardComponent', () => {
  let component: PersonaleDashboardComponent;
  let fixture: ComponentFixture<PersonaleDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PersonaleDashboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PersonaleDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
