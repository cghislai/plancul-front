import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BedPreparationTypeSelectComponent } from './bed-preparation-type-select.component';

describe('BedPreparationTypeSelectComponent', () => {
  let component: BedPreparationTypeSelectComponent;
  let fixture: ComponentFixture<BedPreparationTypeSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BedPreparationTypeSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BedPreparationTypeSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
