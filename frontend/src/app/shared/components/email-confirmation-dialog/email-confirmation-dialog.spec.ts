import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailConfirmationDialog } from './email-confirmation-dialog';

describe('EmailConfirmationDialog', () => {
  let component: EmailConfirmationDialog;
  let fixture: ComponentFixture<EmailConfirmationDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailConfirmationDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmailConfirmationDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
