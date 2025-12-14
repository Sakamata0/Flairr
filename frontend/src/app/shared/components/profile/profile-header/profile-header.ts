import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { EditProfilePopup } from '../edit-profile-popup/edit-profile-popup';
import { UserService } from '../../../../core/services/user.service';
import { MessagingService } from '../../../../core/services/messaging.service';
import { FlurrsService } from '../../../../core/services/flurrs.service';
import { supabase } from '../../../../core/supabase/supabase.client';

@Component({
  selector: 'app-profile-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-header.html',
  styleUrls: ['./profile-header.css']
})
export class ProfileHeader implements OnChanges {
  @Input() profile: any | null = null;
  
  isLoadingMessage = false;
  isJoining = false;
  isMember = false;


  flurrsNumber: number = 0;

  constructor(
    private dialog: MatDialog,
    private userService: UserService,
    private messagingService: MessagingService,
    private router: Router,
    private flurrsService: FlurrsService

  ) {}


  async ngOnChanges(changes: SimpleChanges) {
    if (changes['profile']) {

      // USER PROFILE → load flurrs count
      if (this.profile?.user_id) {
        await this.totalFlurrs();
      }

      // SPACE PROFILE → check membership
      if (this.profile?.space_id) {
        await this.checkIfMember();
      }
    }
  }


  async checkIfMember() {
    const me = this.userService.currentUser();
    if (!me || !this.profile?.space_id) return;

    const { data } = await supabase
      .from('join_spaces')
      .select('user_id')
      .eq('user_id', me.userID)
      .eq('space_id', this.profile.space_id)
      .maybeSingle();

    this.isMember = !!data;
  }

  async joinSpace() {
    const me = this.userService.currentUser();
    if (!me || !this.profile?.space_id) return;

    this.isJoining = true;

    try {
      await supabase
        .from('join_spaces')
        .insert({
          user_id: me.userID,
          space_id: this.profile.space_id
        });

      this.isMember = true;
    } catch (err) {
      console.error('[JoinSpace]', err);
      alert('Failed to join space');
    } finally {
      this.isJoining = false;
    }
  }

  async leaveSpace() {
    const me = this.userService.currentUser();
    if (!me || !this.profile?.space_id) return;

    this.isJoining = true;

    try {
      await supabase
        .from('join_spaces')
        .delete()
        .eq('user_id', me.userID)
        .eq('space_id', this.profile.space_id);

      this.isMember = false;
    } catch (err) {
      console.error('[LeaveSpace]', err);
      alert('Failed to leave space');
    } finally {
      this.isJoining = false;
    }
  }



  async totalFlurrs() {
    try {
      const total = await this.flurrsService.getFlurrsNumber(
        this.profile!.user_id,
        'flurr'
      );
      this.flurrsNumber = total;
    } catch (err) {
      console.warn('[Profile] flurrsErr', err);
      this.flurrsNumber = 0;
    }
  }

  get isUserProfile(): boolean {
    return !!this.profile?.user_id;
  }

  get isSpaceProfile(): boolean {
    return !!this.profile?.space_id;
  }


  get effectiveProfile() {
    return this.profile;
  }

  get isOwnProfile(): boolean {
    const p = this.profile;
    const me = this.userService.currentUser();

    if (!p || !me) return false;

    // USER PROFILE
    if (p.user_id) {
      return p.user_id === me.userID;
    }

    // SPACE PROFILE
    if (p.space_id && p.owner_id) {
      return p.owner_id === me.userID;
    }

    return false;
  }



  formatFollowerCount(count: number | null | undefined): string {
    const c = count ?? 0;
    if (c >= 1_000_000) return (c / 1_000_000).toFixed(1) + 'M';
    if (c >= 1_000) return (c / 1_000).toFixed(1) + 'K';
    return String(c);
  }

  openEditProfileDialog() {
    const p = this.effectiveProfile;
    if (!p) return;

    const dialogData = {
      fullName: p.full_name ?? p.fullName ?? '',
      bio: p.bio ?? '',
      avatarUrl: p.avatar_img ?? p.avatarImg ?? '',
      bannerUrl: p.cover_img ?? p.coverImg ?? '',
      email: p.email ?? ''
    };
    if (!this.profile) return;

    const dialogRef = this.dialog.open(EditProfilePopup, {
      width: '100vw',
      maxWidth: '700px',
      maxHeight: '90vh',
      panelClass: 'edit-profile-dialog',
      data: {
        fullName: this.profile.full_name ?? '',
        bio: this.profile.bio ?? '',
        avatarUrl: this.profile.avatar_img ?? '',
        bannerUrl: this.profile.cover_img ?? '',
        email: this.profile.email ?? ''
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) window.location.reload();
    });
  }

  /**
   * Open messaging with this user
   */
  async openMessageDialog() {
    console.log('=== openMessageDialog START ===');
    
    const p = this.effectiveProfile;
    console.log('1. Profile:', p);
    
    if (!p) {
      console.error('❌ No profile available');
      alert('Profile not loaded. Please try again.');
      return;
    }

    const otherUserId = p.user_id ?? p.userID;
    console.log('2. Other user ID:', otherUserId);
    
    if (!otherUserId) {
      console.error('❌ No user ID available');
      alert('User ID not found. Please try again.');
      return;
    }

    // Don't allow messaging yourself
    if (this.isOwnProfile) {
      console.warn('⚠️ Cannot message yourself');
      alert('You cannot message yourself.');
      return;
    }

    // Check current user
    const currentUser = this.userService.currentUser();
    console.log('3. Current user:', currentUser);
    
    if (!currentUser) {
      console.error('❌ No current user');
      alert('You must be logged in to send messages.');
      return;
    }

    this.isLoadingMessage = true;

    try {
      console.log('4. Calling findOrCreateConversation with:', otherUserId);

      // Find or create conversation
      const conversationId = await this.messagingService.findOrCreateConversation(otherUserId);
      
      console.log('5. Conversation ID received:', conversationId);

      if (!conversationId) {
        throw new Error('No conversation ID returned');
      }

      // Prepare contact data for navigation
      const contactData = {
        id: otherUserId,
        name: p.full_name ?? p.fullName ?? 'User',
        avatar: p.avatar_img ?? p.avatarImg ?? null,
        conversationId: conversationId
      };

      console.log('6. Navigating to /messages with state:', contactData);

      // Navigate to messages page with the conversation pre-selected
      await this.router.navigate(['/messages'], {
        state: {
          openConversation: contactData
        }
      });

      console.log('7. Navigation complete');
      console.log('=== openMessageDialog END ===');

    } catch (error: any) {
      console.error('❌ Error in openMessageDialog:', error);
      console.error('Error details:', {
        message: error?.message,
        stack: error?.stack,
        name: error?.name
      });
      
      alert('Failed to open conversation. Please try again.\nError: ' + (error?.message || 'Unknown error'));
    } finally {
      this.isLoadingMessage = false;
    }
  }
}
