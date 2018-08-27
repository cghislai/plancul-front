import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminInitComponent } from './admin-init.component';

describe('AdminInitComponent', () => {
  let component: AdminInitComponent;
  let fixture: ComponentFixture<AdminInitComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminInitComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminInitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
