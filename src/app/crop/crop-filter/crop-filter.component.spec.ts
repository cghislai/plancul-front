import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CropFilterComponent } from './crop-filter.component';

describe('CropFilterComponent', () => {
  let component: CropFilterComponent;
  let fixture: ComponentFixture<CropFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CropFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CropFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
