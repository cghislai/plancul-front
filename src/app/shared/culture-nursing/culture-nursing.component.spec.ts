import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CultureNursingComponent } from './culture-nursing.component';

describe('CultureNursingComponent', () => {
  let component: CultureNursingComponent;
  let fixture: ComponentFixture<CultureNursingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CultureNursingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CultureNursingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
