import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewChecked,
  ChangeDetectorRef
} from '@angular/core';
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
export class ChatView implements OnChanges, AfterViewChecked, OnDestroy {

  @Input() thread: Contact | null = null;

  displayThread: Contact | null = null;
  messages: Message[] = [];
  text = '';
  loadingThreadHeader = true;

  private convId?: string;
  private sub: Subscription | null = null;
  private shouldScrollToBottom = false;

  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;

  constructor(
    private messaging: MessagingService,
    private cdr: ChangeDetectorRef
  ) { }

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
    if (!this.scrollContainer?.nativeElement) return;

    const el = this.scrollContainer.nativeElement;
    el.scrollTop = el.scrollHeight;
  }

  async loadForThread() {
    if (!this.thread) {
      this.messages = [];
      return;
    }

    if (this.sub) {
      this.sub.unsubscribe();
      this.sub = null;
    }

    this.convId = (this.thread as any).conversationId;

    if (!this.convId) {
      this.convId = await this.messaging.findOrCreateConversation(this.thread.id);
      (this.thread as any).conversationId = this.convId;
    }

    this.displayThread = this.thread;
    this.loadingThreadHeader = false;

    this.messages = await this.messaging.fetchMessages(this.convId, 200);
    this.shouldScrollToBottom = true;

    this.sub = this.messaging.observeMessages(this.convId).subscribe(m => {
      this.handleIncomingMessage(m);
    });
  }

  private handleIncomingMessage(m: Message) {
    const exists = this.messages.find(x => x.id === m.id);
    if (exists) return;

    this.messages.push(m);
    this.shouldScrollToBottom = true;
    this.cdr.detectChanges();
  }

  trackByMsg(_: number, m: Message) {
    return m.id;
  }

  async sendLike() {
    if (!this.thread) return;

    const payload = '👍';

    // Optimistic message
    const tempId = `tmp-like-${Date.now()}`;
    const temp: Message = {
      id: tempId,
      content: payload,
      created_at: new Date().toISOString(),
      from: 'me',
      avatar: 'assets/images/profile-picture-test.jpg',
      authorName: 'You',
      conversation_id: this.convId!,
      authorId: ''
    };

    // Show instantly
    this.messages.push(temp);
    this.shouldScrollToBottom = true;
    this.cdr.detectChanges();

    try {
      // Ensure conversation exists
      if (!this.convId) {
        this.convId = await this.messaging.findOrCreateConversation(this.thread.id);
        (this.thread as any).conversationId = this.convId;
        temp.conversation_id = this.convId;
      }

      // Send 👍 as a normal message
      const saved = await this.messaging.sendMessage(this.convId!, payload);

      // Replace optimistic message
      const idx = this.messages.findIndex(m => m.id === tempId);
      if (idx !== -1) {
        this.messages[idx] = saved;
        this.cdr.detectChanges();
      }

    } catch (err) {
      console.error('❌ Like send failed', err);

      // Rollback optimistic UI
      this.messages = this.messages.filter(m => m.id !== tempId);
      this.cdr.detectChanges();
    }
  }


  async send() {
    const payload = this.text?.trim();
    if (!payload || !this.thread) return;

    const tempId = `tmp-${Date.now()}`;
    const temp: Message = {
      id: tempId,
      content: payload,
      created_at: new Date().toISOString(),
      from: 'me',
      avatar: 'assets/images/profile-picture-test.jpg',
      authorName: 'You',
      conversation_id: this.convId!,
      authorId: ''
    };

    this.messages.push(temp);
    this.text = '';
    this.shouldScrollToBottom = true;
    this.cdr.detectChanges();

    try {
      const saved = await this.messaging.sendMessage(this.convId!, payload);
      const idx = this.messages.findIndex(m => m.id === tempId);
      if (idx !== -1) this.messages[idx] = saved;
      this.cdr.detectChanges();
    } catch {
      this.messages = this.messages.filter(m => m.id !== tempId);
      this.text = payload;
      this.cdr.detectChanges();
    }
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
  }
}
