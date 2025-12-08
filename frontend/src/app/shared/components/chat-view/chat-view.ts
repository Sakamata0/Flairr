// chat-view.ts
import { Component, Input, OnChanges, SimpleChanges, OnDestroy, ViewChild, ElementRef, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { MessagingService } from '../../../core/services/messaging.service';
import { Contact, Message } from '../../model/messaging.models';

@Component({
  selector: 'app-chat-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-view.html',
  styleUrls: ['./chat-view.css']
})
export class ChatView implements OnChanges, OnDestroy, AfterViewChecked {
  @Input() thread: Contact | null = null;

  messages: Message[] = [];
  loadingOlder = false;
  text = '';

  private convId: string | undefined;
  private sub: Subscription | null = null;
  private shouldScrollToBottom = false;

  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;

  constructor(
    private messaging: MessagingService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['thread']) {
      this.loadForThread();
    }
  }

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  private scrollToBottom() {
    try {
      if (this.scrollContainer?.nativeElement) {
        const el = this.scrollContainer.nativeElement;
        el.scrollTop = el.scrollHeight;
      }
    } catch {}
  }

  async loadForThread() {
    console.log('🔄 Loading thread:', this.thread);

    // Cleanup previous subscription
    if (this.sub) {
      try { 
        this.sub.unsubscribe(); 
      } catch {}
      this.sub = null;
    }

    if (!this.thread) {
      this.messages = [];
      this.convId = undefined;
      return;
    }

    // Get conversation ID
    this.convId = (this.thread as any).conversationId ?? undefined;

    if (!this.convId) {
      try {
        const conv = await this.messaging.findOrCreateConversation(this.thread.id);
        this.convId = conv;
        (this.thread as any).conversationId = conv;
        console.log('✅ Conversation created/found:', this.convId);
      } catch (err) {
        console.error('❌ Failed to find/create conversation', err);
        this.messages = [];
        return;
      }
    }

    // Load message history
    try {
      this.loadingOlder = true;
      const msgs = await this.messaging.fetchMessages(this.convId, 200);
      this.messages = msgs;
      this.shouldScrollToBottom = true;
      console.log('📨 Loaded messages:', this.messages.length);
    } catch (err) {
      console.error('❌ Failed to load messages', err);
      this.messages = [];
    } finally {
      this.loadingOlder = false;
    }

    // Subscribe to realtime updates
    if (this.convId) {
      console.log('🔌 Subscribing to realtime for conversation:', this.convId);
      
      this.sub = this.messaging.observeMessages(this.convId).subscribe({
        next: (m) => {
          console.log('🔔 Realtime message received:', m);
          this.handleIncomingMessage(m);
        },
        error: (err) => {
          console.error('❌ Realtime subscription error:', err);
        }
      });
    }
  }

  private handleIncomingMessage(m: Message) {
    // Check if message already exists by ID
    const existingIndex = this.messages.findIndex(x => x.id === m.id);
    
    if (existingIndex !== -1) {
      console.log('⚠️ Message already exists, updating:', m.id);
      // Update existing message (in case content changed)
      this.messages[existingIndex] = m;
      this.cdr.detectChanges();
      return;
    }

    // Check for optimistic message to replace
    const tempIndex = this.messages.findIndex(x =>
      typeof x.id === 'string' &&
      x.id.startsWith('tmp-') &&
      x.from === 'me' &&
      x.content === m.content &&
      // Make sure it's recent (within last 10 seconds)
      x.created_at && 
      (new Date().getTime() - new Date(x.created_at).getTime()) < 10000
    );

    if (tempIndex !== -1) {
      console.log('🔄 Replacing optimistic message with server message');
      this.messages[tempIndex] = m;
      this.cdr.detectChanges();
      return;
    }

    // Add new message
    console.log('➕ Adding new message to UI');
    this.messages.push(m);
    this.shouldScrollToBottom = true;
    this.cdr.detectChanges();
  }

  trackByMsg(_: number, item: Message) {
    return item.id;
  }

  async send() {
    const payload = this.text?.trim();
    if (!payload || !this.thread) return;

    console.log('📤 Sending message:', payload);

    // Create optimistic UI message
    const tempId = `tmp-${Date.now()}`;
    const temp: Message = {
      id: tempId,
      content: payload,
      created_at: new Date().toISOString(),
      from: 'me',
      avatar: 'assets/images/profile-picture-test.jpg',
      authorName: 'You',
      conversation_id: this.convId,
      authorId: '' // Will be filled by server
    };

    // Add optimistic message immediately
    this.messages.push(temp);
    this.shouldScrollToBottom = true;
    this.text = '';
    this.cdr.detectChanges();

    try {
      // Ensure conversation exists
      if (!this.convId) {
        this.convId = await this.messaging.findOrCreateConversation(this.thread.id);
        (this.thread as any).conversationId = this.convId;
        temp.conversation_id = this.convId;
      }

      // Send message
      const saved = await this.messaging.sendMessage(this.convId!, payload);
      console.log('✅ Message sent successfully:', saved);

      // Replace optimistic message with server response
      const tempIdx = this.messages.findIndex(m => m.id === tempId);
      if (tempIdx !== -1) {
        this.messages[tempIdx] = saved;
        this.cdr.detectChanges();
      }

      // Note: The realtime listener will also receive this message
      // but handleIncomingMessage will deduplicate it
      
    } catch (err) {
      console.error('❌ Send failed', err);
      
      // Remove optimistic message on error
      this.messages = this.messages.filter(m => m.id !== tempId);
      
      // Restore text so user can retry
      this.text = payload;
      this.cdr.detectChanges();
    }
  }

  ngOnDestroy() {
    if (this.sub) {
      try { 
        this.sub.unsubscribe(); 
      } catch {}
      this.sub = null;
    }
  }
}