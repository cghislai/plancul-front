import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BedFilterComponent } from './bed-filter.component';

describe('BedFilterComponent', () => {
  let component: BedFilterComponent;
  let fixture: ComponentFixture<BedFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BedFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BedFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
