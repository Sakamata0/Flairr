// profile-header.ts - FIXED VERSION
import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { EditProfilePopup } from '../edit-profile-popup/edit-profile-popup';
import { UserService } from '../../../../core/services/user.service';

@Component({
  selector: 'app-profile-header',
  standalone: true,
  imports: [NgIf],
  templateUrl: './profile-header.html',
  styleUrls: ['./profile-header.css']
})
export class ProfileHeader {
  @Input() profile: any | null = null;

  constructor(
    private dialog: MatDialog,
    private userService: UserService
  ) {}

  get effectiveProfile() {
    if (!this.profile) return null;

    // Always return the profile from @Input with properly loaded data
    return this.profile;
  }

  get isOwnProfile(): boolean {
    const p = this.effectiveProfile;
    const me = this.userService.currentUser();
    if (!p || !me) return false;
    
    const profileId = p.user_id ?? p.userID;
    const meId = me.userID;
    
    return profileId === meId;
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

    // Transform profile data to match EditProfilePopup expectations
    const dialogData = {
      fullName: p.full_name ?? p.fullName ?? '',
      bio: p.bio ?? '',
      avatarUrl: p.avatar_img ?? p.avatarImg ?? '',
      bannerUrl: p.cover_img ?? p.coverImg ?? '',
      email: p.email ?? ''
    };

    const dialogRef = this.dialog.open(EditProfilePopup, {
      width: '100vw',
      maxWidth: '700px',
      maxHeight: '90vh',
      panelClass: 'edit-profile-dialog',
      data: dialogData
    });

    // Reload profile after edit
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Profile updated, reloading...');
        // Trigger a reload by dispatching a custom event or calling parent component
        window.location.reload(); // Simple solution, or use a better pattern
      }
    });
  }
}