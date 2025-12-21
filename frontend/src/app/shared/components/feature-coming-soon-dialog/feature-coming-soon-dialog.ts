import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-feature-coming-soon-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './feature-coming-soon-dialog.html',
  styleUrl: './feature-coming-soon-dialog.css'
})
export class FeatureComingSoonDialog {
  @Input() open = false;
  @Input() title = 'Coming Soon';
  @Input() message = 'This feature is currently under development.';
  @Input() confirmLabel = 'Understood';
  
  @Output() confirm = new EventEmitter<void>();

  onConfirm() {
    this.confirm.emit();
  }

  onOverlayClick() {
    this.confirm.emit();
  }
}