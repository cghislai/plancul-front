import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {NewCropRouteComponent} from './new-crop-route.component';


describe('CropFormComponent', () => {
  let component: NewCropRouteComponent;
  let fixture: ComponentFixture<NewCropRouteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NewCropRouteComponent],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewCropRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
