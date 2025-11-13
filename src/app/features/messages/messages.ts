import { Component } from '@angular/core';
import { ContactsList } from '../../shared/components/contacts-list/contacts-list';
import { ChatView } from '../../shared/components/chat-view/chat-view';

@Component({
  selector: 'app-messages',
  imports: [
    ContactsList
  ],
  templateUrl: './messages.html',
  styleUrl: './messages.css'
})
export class Messages {

}
