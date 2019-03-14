import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CultureCalendarComponent } from './culture-calendar.component';

describe('CultureCalendarComponent', () => {
  let component: CultureCalendarComponent;
  let fixture: ComponentFixture<CultureCalendarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CultureCalendarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CultureCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
