import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountInitComponent } from './account-init.component';

describe('AccountInitComponent', () => {
  let component: AccountInitComponent;
  let fixture: ComponentFixture<AccountInitComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountInitComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountInitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
