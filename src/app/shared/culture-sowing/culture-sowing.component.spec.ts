import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CultureSowingComponent } from './culture-sowing.component';

describe('CultureSowingComponent', () => {
  let component: CultureSowingComponent;
  let fixture: ComponentFixture<CultureSowingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CultureSowingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CultureSowingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
