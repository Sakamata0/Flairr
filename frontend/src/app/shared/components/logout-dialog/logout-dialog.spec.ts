import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogoutDialog } from './logout-dialog';

describe('LogoutDialog', () => {
  let component: LogoutDialog;
  let fixture: ComponentFixture<LogoutDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogoutDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LogoutDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
