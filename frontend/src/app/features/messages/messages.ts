// messages.ts
import { Component, OnInit } from '@angular/core';
import { ContactsList } from '../../shared/components/contacts-list/contacts-list';
import { ChatView } from '../../shared/components/chat-view/chat-view';
import { CommonModule } from '@angular/common';
import { MessagingService } from '../../core/services/messaging.service';
import { Contact } from '../../shared/model/messaging.models';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [
    CommonModule,
    ContactsList,
    ChatView
  ],
  templateUrl: './messages.html',
  styleUrls: ['./messages.css']
})
export class Messages implements OnInit {
  selectedThread: Contact | null = null;
  contacts: Contact[] = [];
  loading = false;

  constructor(private messaging: MessagingService) { }

  async ngOnInit() {

    const user = await this.messaging.getCurrentUser();
    console.log("CURRENT USER ID =", user?.id);

    this.loading = true;
    try {
      this.contacts = await this.messaging.fetchConversations();
    } catch (err) {
      console.error('Failed to load conversations', err);
      this.contacts = [];
    } finally {
      this.loading = false;
    }
    
    this.loading = true;
    try {
      // load conversation-based contacts
      this.contacts = await this.messaging.fetchConversations();
    } catch (err) {
      console.error('Failed to load conversations', err);
      this.contacts = [];
    } finally {
      this.loading = false;
    }
  }

  async openConversation(threadOrContact: Contact) {
    // threadOrContact.id is the other user's user_id
    // conversationId may be present already (threadOrContact.conversationId)
    if (!threadOrContact) return;

    // If there's no conversationId attached, create/find it
    if (!(threadOrContact as any).conversationId) {
      try {
        const convId = await this.messaging.findOrCreateConversation(threadOrContact.id);
        (threadOrContact as any).conversationId = convId;
      } catch (err) {
        console.error('Could not create conversation', err);
        return;
      }
    }

    // set selectedThread (the ChatView expects a Contact)
    this.selectedThread = threadOrContact;
  }
}
