import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-email-confirmation-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './email-confirmation-dialog.html',
  styleUrl: './email-confirmation-dialog.css'
})
export class EmailConfirmationDialog {
  @Input() open = false;
  @Input() title = 'Verify Your Email';
  @Input() message = 'Please check your email to verify your account.';
  @Input() email = '';
  @Input() confirmLabel = 'Got it!';
  
  @Output() confirm = new EventEmitter<void>();

  onConfirm() {
    this.confirm.emit();
  }

  onOverlayClick() {
    this.confirm.emit();
  }
}