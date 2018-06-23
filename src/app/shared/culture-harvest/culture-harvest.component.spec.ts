import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CultureHarvestComponent } from './culture-harvest.component';

describe('CultureHarvestComponent', () => {
  let component: CultureHarvestComponent;
  let fixture: ComponentFixture<CultureHarvestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CultureHarvestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CultureHarvestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
