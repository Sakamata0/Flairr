// src/app/shared/components/profile/profile-header/profile-header.ts
import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { EditProfilePopup } from '../edit-profile-popup/edit-profile-popup';
import { UserService } from '../../../../core/services/user.service'; // adjust path if needed

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

  // return the profile to display: input OR current user from service
  get effectiveProfile() {
    return this.profile ?? this.userService.currentUser();
  }

  // boolean: true if the shown profile matches the logged-in user
  get isOwnProfile(): boolean {
    const shown = this.effectiveProfile;
    const me = this.userService.currentUser();
    if (!shown || !me) return false;

    // DB user row uses user_id; internal User uses userID — check both
    const shownId = shown.user_id ?? shown.userID ?? shown.id ?? null;
    const myId = (me as any).userID ?? (me as any).user_id ?? (me as any).id ?? null;
    return !!(shownId && myId && shownId === myId);
  }

  formatFollowerCount(count: number | undefined | null): string {
    const c = count ?? 0;
    if (c >= 1_000_000) return (c / 1_000_000).toFixed(1) + 'M';
    if (c >= 1_000) return (c / 1_000).toFixed(1) + 'K';
    return String(c);
  }

  openEditProfileDialog() {
    const p = this.effectiveProfile;
    if (!p) return;

    this.dialog.open(EditProfilePopup, {
      width: '100vw',
      maxWidth: '700px',
      height: 'auto',
      maxHeight: '90vh',
      panelClass: 'edit-profile-dialog',
      autoFocus: false,
      data: p
    });
  }
}
