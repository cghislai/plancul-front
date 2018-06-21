import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CropSearchQueryTypeComponent } from './crop-search-query-type.component';

describe('CropSearchQueryTypeComponent', () => {
  let component: CropSearchQueryTypeComponent;
  let fixture: ComponentFixture<CropSearchQueryTypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CropSearchQueryTypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CropSearchQueryTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
