import { Component, Input, OnInit } from '@angular/core';
import { NgIf, DatePipe } from '@angular/common';
import { Contact } from '../../model/messaging.models';
import { MessagingService } from '../../../core/services/messaging.service';

@Component({
  selector: 'app-message-component',
  standalone: true,
  imports: [NgIf, DatePipe],
  templateUrl: './message-component.html',
  styleUrls: ['./message-component.css']
})
export class MessageComponent implements OnInit {
  @Input() contact!: Contact;
  
  // Display contact with correct user details
  displayContact: Contact | null = null;
  loading = true;
  
  constructor(private messaging: MessagingService) { }
  
  async ngOnInit() {
    this.loading = true;
    
    const convId = this.contact.conversationId;
    
    if (!convId) {
      // No conversation ID, use contact as-is
      this.displayContact = this.contact;
      this.loading = false;
      return;
    }
    
    try {
      // Fetch conversation details to get the other user's info
      const details = await this.messaging.getConversationDetails(convId);
      
      if (!details) {
        console.warn('No conversation details found for', convId);
        this.displayContact = this.contact;
        this.loading = false;
        return;
      }
      
      const { otherUser } = details;
      
      // Update display contact with correct user info
      this.displayContact = {
        ...this.contact,
        id: otherUser.user_id,
        name: otherUser.full_name || otherUser.user_id,
        avatar: otherUser.avatar_img || this.contact.avatar,
        conversationId: convId
      };
      
      console.log('✅ MessageComponent loaded other user:', this.displayContact.name);
      
    } catch (err) {
      console.error('❌ Failed to get conversation details', err);
      // Fallback to original contact
      this.displayContact = this.contact;
    } finally {
      this.loading = false;
    }
  }
}