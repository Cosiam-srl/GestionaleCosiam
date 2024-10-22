import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatepickerSingleComponent } from './datepicker-single.component';

describe('DatepickerSingleComponent', () => {
  let component: DatepickerSingleComponent;
  let fixture: ComponentFixture<DatepickerSingleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DatepickerSingleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DatepickerSingleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
