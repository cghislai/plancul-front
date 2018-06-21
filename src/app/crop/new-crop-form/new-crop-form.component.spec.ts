import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewCropFormComponent } from './crop-form.component';

describe('CropFormComponent', () => {
  let component: NewCropFormComponent;
  let fixture: ComponentFixture<NewCropFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewCropFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewCropFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
