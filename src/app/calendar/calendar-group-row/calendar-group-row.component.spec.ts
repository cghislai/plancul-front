import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarGroupRowComponent } from './calendar-group-row.component';

describe('CalendarGroupRowComponent', () => {
  let component: CalendarGroupRowComponent;
  let fixture: ComponentFixture<CalendarGroupRowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CalendarGroupRowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CalendarGroupRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
