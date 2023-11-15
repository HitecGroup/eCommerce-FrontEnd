import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogViewImgComponent } from './dialog-view-img.component';

describe('DialogViewImgComponent', () => {
  let component: DialogViewImgComponent;
  let fixture: ComponentFixture<DialogViewImgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogViewImgComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogViewImgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
