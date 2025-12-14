// src/app/shared/components/new-message-dialog/new-message-dialog.component.ts
import { Component, EventEmitter, Output, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { supabase } from '../../../core/supabase/supabase.client';

interface UserSearchResult {
  user_id: string;
  full_name: string;
  avatar_img: string | null;
  email?: string;
}

@Component({
  selector: 'app-new-message-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './new-message-dialog.html',
  styleUrls: ['./new-message-dialog.css']
})
export class NewMessageDialogComponent implements OnInit {
  @Output() userSelected = new EventEmitter<UserSearchResult>();
  @Output() closed = new EventEmitter<void>();
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  searchQuery = '';
  searchResults: UserSearchResult[] = [];
  loading = false;
  private searchTimeout: any;

  ngOnInit() {
    // Focus search input after a short delay
    setTimeout(() => {
      this.searchInput?.nativeElement?.focus();
    }, 100);
  }

  onSearchInput() {
    clearTimeout(this.searchTimeout);
    
    if (this.searchQuery.trim().length === 0) {
      this.searchResults = [];
      return;
    }

    // Debounce search by 300ms
    this.searchTimeout = setTimeout(() => {
      this.searchUsers();
    }, 300);
  }

  async searchUsers() {
    const query = this.searchQuery.trim();
    if (query.length === 0) return;

    this.loading = true;

    try {
      // Get current user to exclude from results
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('users')
        .select('user_id, full_name, avatar_img, email')
        .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
        .neq('user_id', currentUser?.id || '')
        .limit(10);

      if (error) {
        console.error('Search error:', error);
        throw error;
      }

      this.searchResults = data || [];
      console.log('Search results:', this.searchResults);
    } catch (err) {
      console.error('Error searching users:', err);
      this.searchResults = [];
    } finally {
      this.loading = false;
    }
  }

  selectUser(user: UserSearchResult) {
    console.log('User selected:', user);
    this.userSelected.emit(user);
  }

  close() {
    this.closed.emit();
  }

  onOverlayClick(event: MouseEvent) {
    // Only close if clicking the overlay itself, not its children
    if (event.target === event.currentTarget) {
      this.close();
    }
  }
}