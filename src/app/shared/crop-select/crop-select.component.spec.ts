import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CropSelectComponent } from './crop-select.component';

describe('CropSelectComponent', () => {
  let component: CropSelectComponent;
  let fixture: ComponentFixture<CropSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CropSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CropSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
