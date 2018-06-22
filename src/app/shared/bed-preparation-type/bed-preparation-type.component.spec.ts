import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BedPreparationTypeComponent } from './bed-preparation-type.component';

describe('BedPreparationTypeComponent', () => {
  let component: BedPreparationTypeComponent;
  let fixture: ComponentFixture<BedPreparationTypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BedPreparationTypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BedPreparationTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
