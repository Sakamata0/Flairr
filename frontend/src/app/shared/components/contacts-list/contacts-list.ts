// contacts-list.component.ts - COMPLETE UPDATED VERSION
import { Component, EventEmitter, Input, OnInit, OnDestroy, Output, ChangeDetectorRef } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MessageComponent } from "../message-component/message-component";
import { MessagingService } from '../../../core/services/messaging.service';
import { Contact } from '../../model/messaging.models';

@Component({
    selector: 'app-contacts-list',
    standalone: true,
    imports: [CommonModule, FormsModule, MessageComponent, NgFor],
    templateUrl: './contacts-list.html',
    styleUrls: ['./contacts-list.css']
})
export class ContactsList implements OnInit, OnDestroy {
    @Input() contacts: Contact[] | null = null;
    @Output() openThread = new EventEmitter<Contact>();
    @Output() newMessage = new EventEmitter<void>();

    selectedFilter = 'All';
    query = '';
    selected: Contact | null = null;

    private contactUpdatesSub: Subscription | null = null;
    private currentOpenConversationId: string | null = null;

    constructor(
        private messagingService: MessagingService,
        private cdr: ChangeDetectorRef
    ) { }

    async ngOnInit(): Promise<void> {
        // Load contacts from service
        await this.loadContacts();

        // Subscribe to real-time contact updates
        this.subscribeToContactUpdates();
    }

    async loadContacts(): Promise<void> {
        try {
            console.log('📇 Loading contacts...');
            this.contacts = await this.messagingService.fetchConversations();
            console.log('✅ Loaded', this.contacts.length, 'contacts');
        } catch (err) {
            console.error('❌ Error loading contacts:', err);
            this.contacts = [];
        }
    }

    private subscribeToContactUpdates(): void {
        this.contactUpdatesSub = this.messagingService.contactUpdates.subscribe({
            next: async ({ conversationId, update }) => {
                console.log('📢 Contact update received:', conversationId);
                await this.handleContactUpdate(conversationId, update);
            },
            error: (err) => {
                console.error('❌ Contact updates subscription error:', err);
            }
        });
    }

    private async handleContactUpdate(conversationId: string, update: Partial<Contact>): Promise<void> {
        if (!this.contacts) return;

        const contactIndex = this.contacts.findIndex(c => c.conversationId === conversationId);

        if (contactIndex === -1) {
            // New conversation - reload all contacts
            console.log('🔄 New conversation detected, reloading all contacts');
            await this.loadContacts();
            this.cdr.detectChanges();
            return;
        }

        // Create a NEW contact object instead of mutating the existing one
        // This ensures Angular detects the change
        const oldContact = this.contacts[contactIndex];
        const updatedContact: Contact = {
            ...oldContact,
            lastMessage: update.lastMessage !== undefined ? update.lastMessage : oldContact.lastMessage,
            lastAt: update.lastAt !== undefined ? update.lastAt : oldContact.lastAt
        };

        // Update unread count
        if (conversationId !== this.currentOpenConversationId) {
            try {
                const unreadCount = await this.messagingService.getUnreadCount(conversationId);
                updatedContact.unreadCount = unreadCount;
                console.log('📊 Updated unread count for', updatedContact.name, ':', unreadCount);
            } catch (err) {
                console.error('❌ Error fetching unread count:', err);
            }
        } else {
            updatedContact.unreadCount = 0;
        }

        // Remove old contact and add updated one at the top
        this.contacts.splice(contactIndex, 1);
        this.contacts.unshift(updatedContact);

        // Create new array reference to trigger change detection
        this.contacts = [...this.contacts];

        // Manually trigger change detection
        this.cdr.detectChanges();
    }

    setFilter(filter: string): void {
        this.selectedFilter = filter;
    }

    get filteredContacts(): Contact[] {
        if (!this.contacts) return [];

        let list = this.contacts;

        // Filter unread if requested
        if (this.selectedFilter === 'Unread') {
            list = list.filter(c => (c.unreadCount || 0) > 0);
        }

        // Apply search query (name & last message)
        const q = this.query?.trim().toLowerCase();
        if (q) {
            list = list.filter(c =>
                (c.name || '').toLowerCase().includes(q) ||
                (c.lastMessage || '').toLowerCase().includes(q)
            );
        }

        // Sort by lastAt desc (most recent first)
        return list.slice().sort((a, b) => {
            const ta = a.lastAt ? new Date(a.lastAt).getTime() : 0;
            const tb = b.lastAt ? new Date(b.lastAt).getTime() : 0;
            return tb - ta;
        });
    }

    selectContact(c: Contact): void {
        console.log('📱 ContactsList.selectContact called with:', c);
        console.log('📊 Contact structure:', {
            id: c.id,
            name: c.name,
            conversationId: c.conversationId,
            avatar: c.avatar,
            lastMessage: c.lastMessage
        });

        this.selected = c;
        this.currentOpenConversationId = c.conversationId || null;

        // Reset unread count by creating a new contact object
        if (this.contacts) {
            const contactIndex = this.contacts.findIndex(contact => contact.id === c.id);
            if (contactIndex !== -1) {
                const updatedContact = { ...this.contacts[contactIndex], unreadCount: 0 };
                this.contacts[contactIndex] = updatedContact;
                this.contacts = [...this.contacts]; // New array reference
                this.cdr.detectChanges();
            }
        }

        // Emit the ORIGINAL contact, not the updated one
        console.log('📤 Emitting contact to parent:', c);
        this.openThread.emit(c);
    }

    onNewMessageClick(): void {
        console.log('➕ New message button clicked');
        this.newMessage.emit();
    }

    clearSearch(): void {
        this.query = '';
    }

    trackById(_: number, item: Contact): string {
        return item.id;
    }

    // Keyboard helpers for list navigation
    focusNext(): void {
        const idx = this.selected ? this.filteredContacts.findIndex(s => s.id === this.selected!.id) : -1;
        const next = this.filteredContacts[Math.min(this.filteredContacts.length - 1, idx + 1)];
        if (next) this.selectContact(next);
    }

    focusPrev(): void {
        const idx = this.selected ? this.filteredContacts.findIndex(s => s.id === this.selected!.id) : this.filteredContacts.length;
        const prev = this.filteredContacts[Math.max(0, idx - 1)];
        if (prev) this.selectContact(prev);
    }

    ngOnDestroy(): void {
        if (this.contactUpdatesSub) {
            this.contactUpdatesSub.unsubscribe();
        }
    }
}