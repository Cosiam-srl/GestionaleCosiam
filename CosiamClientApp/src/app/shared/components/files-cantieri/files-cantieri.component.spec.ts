import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilesCantieriComponent } from './files-cantieri.component';

describe('FilesCantieriComponent', () => {
  let component: FilesCantieriComponent;
  let fixture: ComponentFixture<FilesCantieriComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FilesCantieriComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilesCantieriComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
