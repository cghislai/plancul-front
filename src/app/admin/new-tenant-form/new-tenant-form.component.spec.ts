import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewTenantFormComponent } from './new-tenant-form.component';

describe('NewTenantFormComponent', () => {
  let component: NewTenantFormComponent;
  let fixture: ComponentFixture<NewTenantFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewTenantFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewTenantFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
