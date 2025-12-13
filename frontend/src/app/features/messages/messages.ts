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
  loading = true;

  constructor(private messaging: MessagingService) { }

  async ngOnInit() {
    const user = await this.messaging.getCurrentUser();
    console.log("CURRENT USER ID =", user?.id);

    try {
      // Load conversations only once
      this.contacts = await this.messaging.fetchConversations();
      console.log('📇 Loaded contacts:', this.contacts);
    } catch (err) {
      console.error('Failed to load conversations', err);
      this.contacts = [];
    } finally {
      this.loading = false;
    }
  }

  async openConversation(contact: Contact) {
    console.log('🔓 Opening conversation with contact:', contact);

    if (!contact) {
      console.error('❌ No contact provided');
      return;
    }

    // Verify contact has correct structure
    console.log('📊 Contact details:', {
      id: contact.id,
      name: contact.name,
      conversationId: contact.conversationId,
      avatar: contact.avatar
    });

    // Contact from the list should already have conversationId
    // DON'T modify the contact object - pass it as-is
    if (!contact.conversationId) {
      console.warn('⚠️ Contact missing conversationId, creating conversation...');
      try {
        const convId = await this.messaging.findOrCreateConversation(contact.id);
        // Create a NEW contact object instead of mutating
        this.selectedThread = {
          ...contact,
          conversationId: convId
        };
        console.log('✅ Created conversation:', convId);
      } catch (err) {
        console.error('❌ Could not create conversation', err);
        return;
      }
    } else {
      // Contact already has conversationId - use it directly
      this.selectedThread = contact;
      console.log('✅ Using existing conversation:', contact.conversationId);
    }

    console.log('📱 Selected thread:', this.selectedThread);
  }
}