// messages.component.ts - COMPLETE UPDATED VERSION
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ContactsList } from '../../shared/components/contacts-list/contacts-list';
import { ChatView } from '../../shared/components/chat-view/chat-view';
import { NewMessageDialogComponent } from '../../shared/components/new-message-dialog/new-message-dialog';
import { CommonModule } from '@angular/common';
import { MessagingService } from '../../core/services/messaging.service';
import { Contact } from '../../shared/model/messaging.models';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [
    CommonModule,
    ContactsList,
    ChatView,
    NewMessageDialogComponent
  ],
  templateUrl: './messages.html',
  styleUrls: ['./messages.css']
})
export class Messages implements OnInit {
  selectedThread: Contact | null = null;
  contacts: Contact[] = [];
  loading = true;
  showNewMessageDialog = false;

  constructor(
    private messaging: MessagingService,
    private router: Router
  ) { }

  async ngOnInit() {
    const user = await this.messaging.getCurrentUser();
    console.log("CURRENT USER ID =", user?.id);

    try {
      // Load conversations
      this.contacts = await this.messaging.fetchConversations();
      console.log('📇 Loaded contacts:', this.contacts);
    } catch (err) {
      console.error('Failed to load conversations', err);
      this.contacts = [];
    } finally {
      this.loading = false;
    }

    // Check if we should auto-open a conversation (from profile button)
    this.checkForAutoOpenConversation();
  }

  /**
   * Check if navigation state contains a conversation to auto-open
   */
  private checkForAutoOpenConversation() {
    try {
      const navigation = this.router.getCurrentNavigation();
      const state = navigation?.extras?.state || (window.history.state as any);

      console.log('🔍 Navigation state:', state);

      if (state?.openConversation) {
        const contactToOpen = state.openConversation;
        console.log('🎯 Auto-opening conversation:', contactToOpen);

        // Small delay to ensure contacts are loaded
        setTimeout(() => {
          this.autoOpenConversation(contactToOpen);
        }, 300);
      }
    } catch (err) {
      console.error('Error checking auto-open conversation:', err);
    }
  }

  /**
   * Auto-open a conversation from navigation state
   */
  private async autoOpenConversation(contactData: any) {
    try {
      console.log('🔓 Auto-opening conversation with:', contactData);

      // Check if this contact is already in the list
      let contact = this.contacts.find(c => 
        c.id === contactData.id || 
        c.conversationId === contactData.conversationId
      );

      if (contact) {
        // Contact already exists in list - open it
        console.log('✅ Found existing contact in list');
        this.selectedThread = contact;
      } else {
        // Create a new contact object for display
        console.log('ℹ️ Creating new contact for display');
        
        const newContact: Contact = {
          id: contactData.id,
          name: contactData.name,
          avatar: contactData.avatar,
          conversationId: contactData.conversationId,
          lastMessage: null,
          lastAt: null,
          unreadCount: 0,
          online: false
        };

        // Add to contacts list at the top
        this.contacts = [newContact, ...this.contacts];
        this.selectedThread = newContact;
      }

      console.log('✅ Conversation auto-opened:', this.selectedThread);

    } catch (err) {
      console.error('❌ Error auto-opening conversation:', err);
    }
  }

  async openConversation(contact: Contact) {
    console.log('🔓 Opening conversation with contact:', contact);

    if (!contact) {
      console.error('❌ No contact provided');
      return;
    }

    console.log('📊 Contact details:', {
      id: contact.id,
      name: contact.name,
      conversationId: contact.conversationId,
      avatar: contact.avatar
    });

    if (!contact.conversationId) {
      console.warn('⚠️ Contact missing conversationId, creating conversation...');
      try {
        const convId = await this.messaging.findOrCreateConversation(contact.id);
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
      this.selectedThread = contact;
      console.log('✅ Using existing conversation:', contact.conversationId);
    }

    console.log('📱 Selected thread:', this.selectedThread);
  }

  /**
   * Open the new message dialog
   */
  openNewMessageDialog() {
    this.showNewMessageDialog = true;
  }

  /**
   * Close the new message dialog
   */
  closeNewMessageDialog() {
    this.showNewMessageDialog = false;
  }

  /**
   * Handle user selection from new message dialog
   */
  async onUserSelected(user: any) {
    console.log('👤 User selected for new conversation:', user);
    
    this.closeNewMessageDialog();

    try {
      // Check if conversation already exists
      const existingContact = this.contacts.find(c => c.id === user.user_id);
      
      if (existingContact) {
        // Open existing conversation
        console.log('✅ Opening existing conversation');
        this.selectedThread = existingContact;
      } else {
        // Create new conversation
        console.log('🆕 Creating new conversation');
        const convId = await this.messaging.findOrCreateConversation(user.user_id);
        
        const newContact: Contact = {
          id: user.user_id,
          name: user.full_name,
          avatar: user.avatar_img,
          conversationId: convId,
          lastMessage: null,
          lastAt: null,
          unreadCount: 0,
          online: false
        };

        // Add to contacts list at the top
        this.contacts = [newContact, ...this.contacts];
        this.selectedThread = newContact;
        
        console.log('✅ New conversation created and opened');
      }
    } catch (err) {
      console.error('❌ Error creating conversation:', err);
      alert('Failed to start conversation. Please try again.');
    }
  }
}