import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CultureSortSelectComponent } from './culture-sort-select.component';

describe('CultureSortSelectComponent', () => {
  let component: CultureSortSelectComponent;
  let fixture: ComponentFixture<CultureSortSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CultureSortSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CultureSortSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
