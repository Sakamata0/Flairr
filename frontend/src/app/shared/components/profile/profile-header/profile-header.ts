// profile-header.ts
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
    const serviceUser = this.userService.currentUser();

    if (!this.profile) return serviceUser;
    if (!serviceUser) return this.profile;

    // If viewing your own profile → always use UserService (correct counts)
    const shownId = this.profile.user_id ?? this.profile.userID;
    const meId = serviceUser.userID;

    return shownId === meId ? serviceUser : this.profile;
  }

  get isOwnProfile(): boolean {
    const p = this.effectiveProfile;
    const me = this.userService.currentUser();
    if (!p || !me) return false;
    return (p.user_id ?? p.userID) === me.userID;
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

    this.dialog.open(EditProfilePopup, {
      width: '100vw',
      maxWidth: '700px',
      maxHeight: '90vh',
      panelClass: 'edit-profile-dialog',
      data: p
    });
  }
}
