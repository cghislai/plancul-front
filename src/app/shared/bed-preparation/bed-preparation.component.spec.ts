import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BedPreparationComponent } from './bed-preparation.component';

describe('BedPreparationComponent', () => {
  let component: BedPreparationComponent;
  let fixture: ComponentFixture<BedPreparationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BedPreparationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BedPreparationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
