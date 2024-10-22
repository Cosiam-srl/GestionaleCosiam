import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttrezzaturaTableComponent } from './attrezzatura-table.component';

describe('AttrezzaturaTableComponent', () => {
  let component: AttrezzaturaTableComponent;
  let fixture: ComponentFixture<AttrezzaturaTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AttrezzaturaTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AttrezzaturaTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
