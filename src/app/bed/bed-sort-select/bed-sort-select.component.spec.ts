import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BedSortSelectComponent } from './bed-sort-select.component';

describe('BedSortSelectComponent', () => {
  let component: BedSortSelectComponent;
  let fixture: ComponentFixture<BedSortSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BedSortSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BedSortSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
