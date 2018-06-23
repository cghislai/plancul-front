import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BedsTimelineComponent } from './beds-timeline.component';

describe('BedsTimelineComponent', () => {
  let component: BedsTimelineComponent;
  let fixture: ComponentFixture<BedsTimelineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BedsTimelineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BedsTimelineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
