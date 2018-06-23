import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CultureTransplantingComponent } from './culture-transplanting.component';

describe('CultureTransplantingComponent', () => {
  let component: CultureTransplantingComponent;
  let fixture: ComponentFixture<CultureTransplantingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CultureTransplantingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CultureTransplantingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
