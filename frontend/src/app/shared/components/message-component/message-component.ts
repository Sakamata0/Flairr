import { Component, Input } from '@angular/core';
import { NgIf, DatePipe } from '@angular/common';
import { Contact } from '../../model/messaging.models';

@Component({
  selector: 'app-message-component',
  standalone: true,
  imports: [NgIf, DatePipe],
  templateUrl: './message-component.html',
  styleUrls: ['./message-component.css']
})
export class MessageComponent {
  @Input() contact!: Contact;
}
