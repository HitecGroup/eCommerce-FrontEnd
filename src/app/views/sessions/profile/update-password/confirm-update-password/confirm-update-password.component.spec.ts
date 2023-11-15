import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmUpdatePasswordComponent } from './confirm-update-password.component';

describe('ConfirmUpdatePasswordComponent', () => {
  let component: ConfirmUpdatePasswordComponent;
  let fixture: ComponentFixture<ConfirmUpdatePasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfirmUpdatePasswordComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmUpdatePasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
