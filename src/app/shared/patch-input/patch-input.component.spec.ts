import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatchInputComponent } from './patch-input.component';

describe('PatchInputComponent', () => {
  let component: PatchInputComponent;
  let fixture: ComponentFixture<PatchInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatchInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatchInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
