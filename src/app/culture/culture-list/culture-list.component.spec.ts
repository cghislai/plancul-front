import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CultureListComponent } from './culture-list.component';

describe('CultureListComponent', () => {
  let component: CultureListComponent;
  let fixture: ComponentFixture<CultureListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CultureListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CultureListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
