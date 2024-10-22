import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewUserComponentComponent } from './view-user-component.component';

describe('ViewUserComponentComponent', () => {
  let component: ViewUserComponentComponent;
  let fixture: ComponentFixture<ViewUserComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewUserComponentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewUserComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
