import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AgrovocPlantProductTupleSelectComponent } from './agrovoc-plant-product-tuple-select.component';

describe('AgrovocPlantProductTupleSelectComponent', () => {
  let component: AgrovocPlantProductTupleSelectComponent;
  let fixture: ComponentFixture<AgrovocPlantProductTupleSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AgrovocPlantProductTupleSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AgrovocPlantProductTupleSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
