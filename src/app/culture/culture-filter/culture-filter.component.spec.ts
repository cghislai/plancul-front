import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CultureFilterComponent } from './culture-filter.component';

describe('CultureFilterComponent', () => {
  let component: CultureFilterComponent;
  let fixture: ComponentFixture<CultureFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CultureFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CultureFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
