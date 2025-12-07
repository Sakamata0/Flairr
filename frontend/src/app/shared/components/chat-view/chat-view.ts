// chat-view.ts
import { Component, Input, OnChanges, SimpleChanges, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  private sub: any = null;

  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;

  constructor(private messaging: MessagingService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['thread']) {
      this.loadForThread();
    }
  }

  ngAfterViewChecked() {
    // Scroll to bottom on new messages
    try {
      if (this.scrollContainer?.nativeElement) {
        const el = this.scrollContainer.nativeElement;
        el.scrollTop = el.scrollHeight;
      }
    } catch {}
  }

  async loadForThread() {
    // cleanup previous subscription
    if (this.sub) {
      try { this.sub.unsubscribe(); } catch {}
      this.sub = null;
    }

    if (!this.thread) {
      this.messages = [];
      this.convId = undefined;
      return;
    }

    // If the thread already contains messages (some parent may pass them), use them
    if ((this.thread as any).messages && Array.isArray((this.thread as any).messages)) {
      this.messages = (this.thread as any).messages;
    }

    // conversationId may be attached on Contact by Conversation fetcher.
    // If missing (edge), try to find/create a conversation with that user id.
    // thread.id is the user_id of the other person.
    this.convId = (this.thread as any).conversationId ?? undefined;

    if (!this.convId) {
      try {
        // find or create conversation for this contact user id
        const conv = await this.messaging.findOrCreateConversation(this.thread.id);
        this.convId = conv;
        // attach it to the thread for future use
        (this.thread as any).conversationId = conv;
      } catch (err) {
        console.error('Failed to find/create conversation', err);
        this.messages = this.messages || [];
        return;
      }
    }

    // load messages for the conversation
    try {
      this.loadingOlder = true;
      const msgs = await this.messaging.fetchMessages(this.convId, 200);
      this.messages = msgs;
    } catch (err) {
      console.error('Failed to load messages', err);
      this.messages = this.messages || [];
    } finally {
      this.loadingOlder = false;
    }

    // subscribe realtime
    this.sub = this.messaging.observeMessages(this.convId).subscribe((m) => {
      // ignore duplicates by id (optimistic + server insert)
      if (!this.messages.some(x => x.id === m.id)) {
        this.messages = [...this.messages, m];
      } else {
        // replace temporary messages if IDs match 'tmp-...' etc not matching server ids
        this.messages = this.messages.map(x => x.id === m.id ? m : x);
      }
    });
  }

  trackByMsg(_: number, item: Message) {
    return item.id;
  }

  async send() {
    const payload = this.text?.trim();
    if (!payload || !this.thread) return;

    // optimistic UI message
    const tempId = `tmp-${Date.now()}`;
    const temp: Message = {
      id: tempId,
      content: payload,
      created_at: new Date().toISOString(),
      from: 'me',
      avatar: 'assets/images/profile-picture-test.jpg',
      authorName: 'You'
    };
    // add conversation_id if present
    if (this.convId) temp.conversation_id = this.convId;
    this.messages = [...this.messages, temp];
    this.text = '';

    try {
      // ensure conversation exists (should already)
      if (!this.convId) {
        this.convId = await this.messaging.findOrCreateConversation(this.thread.id);
        (this.thread as any).conversationId = this.convId;
      }

      const saved = await this.messaging.sendMessage(this.convId!, payload);
      // replace temp message with saved one (match by tempId)
      this.messages = this.messages.map(m => (m.id === tempId ? saved : m));
    } catch (err) {
      console.error('Send failed', err);
      // optional: show error and reinsert text
      // remove optimistic message
      this.messages = this.messages.filter(m => m.id !== tempId);
      // re-add text so user can try again
      this.text = payload;
    }
  }

  ngOnDestroy() {
    if (this.sub) {
      try { this.sub.unsubscribe(); } catch {}
      this.sub = null;
    }
  }
}
