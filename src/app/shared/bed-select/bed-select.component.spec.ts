import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BedSelectComponent } from './bed-select.component';

describe('BedSelectComponent', () => {
  let component: BedSelectComponent;
  let fixture: ComponentFixture<BedSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BedSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BedSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
