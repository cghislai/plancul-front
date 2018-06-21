import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CropSortSelectComponent } from './crop-sort-select.component';

describe('CropSortSelectComponent', () => {
  let component: CropSortSelectComponent;
  let fixture: ComponentFixture<CropSortSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CropSortSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CropSortSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
