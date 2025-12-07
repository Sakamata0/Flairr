import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageComponent } from "../message-component/message-component";

export interface Contact {
    id: string;
    name: string;
    avatar?: string | null;
    lastMessage?: string | null;
    unreadCount?: number;
    lastAt?: string | Date | null;
    online?: boolean;
}

@Component({
    selector: 'app-contacts-list',
    standalone: true,
    imports: [CommonModule, FormsModule, MessageComponent , NgFor,],
    templateUrl: './contacts-list.html',
    styleUrls: ['./contacts-list.css']
})
export class ContactsList implements OnInit {
    @Input() contacts: Contact[] | null = null; // allow parent to pass data
    @Output() openThread = new EventEmitter<Contact>(); // emits when a contact is selected

    // local state
    selectedFilter = 'All';
    query = '';
    selected: Contact | null = null;

    ngOnInit(): void {
        // If no contacts were provided by the parent, seed a small mock list for local dev/testing.
        if (!this.contacts) {
            this.contacts = this.mockContacts();
        }
    }

    setFilter(filter: string) {
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

    selectContact(c: Contact) {
        this.selected = c;
        this.openThread.emit(c);
    }

    clearSearch() {
        this.query = '';
    }

    trackById(_: number, item: Contact) {
        return item.id;
    }

    // keyboard helpers for list navigation (basic)
    focusNext() {
        const idx = this.selected ? this.filteredContacts.findIndex(s => s.id === this.selected!.id) : -1;
        const next = this.filteredContacts[Math.min(this.filteredContacts.length - 1, idx + 1)];
        if (next) this.selectContact(next);
    }
    focusPrev() {
        const idx = this.selected ? this.filteredContacts.findIndex(s => s.id === this.selected!.id) : this.filteredContacts.length;
        const prev = this.filteredContacts[Math.max(0, idx - 1)];
        if (prev) this.selectContact(prev);
    }

    // tiny mock data for local dev if parent doesn't provide contacts
    private mockContacts(): Contact[] {
        return [
            { id: 'u1', name: 'Amina', lastMessage: 'See you tomorrow!', unreadCount: 2, lastAt: new Date(Date.now() - 1000 * 60 * 5), online: true },
            { id: 'u2', name: 'Marouane', lastMessage: 'I pushed the changes', unreadCount: 0, lastAt: new Date(Date.now() - 1000 * 60 * 60) },
            { id: 'u3', name: 'Sana', lastMessage: 'Nice! 🔥', unreadCount: 1, lastAt: new Date(Date.now() - 1000 * 60 * 3), online: true },
            { id: 'u4', name: 'Support', lastMessage: 'How can I help?', unreadCount: 0, lastAt: new Date(Date.now() - 1000 * 60 * 60 * 24) }
        ];
    }
}
