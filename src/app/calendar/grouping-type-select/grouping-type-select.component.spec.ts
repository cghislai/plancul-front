import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupingTypeSelectComponent } from './grouping-type-select.component';

describe('GroupingTypeSelectComponent', () => {
  let component: GroupingTypeSelectComponent;
  let fixture: ComponentFixture<GroupingTypeSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupingTypeSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupingTypeSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
