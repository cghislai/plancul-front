import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CultureStepsFormComponent } from './culture-steps-form.component';

describe('CultureStepsFormComponent', () => {
  let component: CultureStepsFormComponent;
  let fixture: ComponentFixture<CultureStepsFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CultureStepsFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CultureStepsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
