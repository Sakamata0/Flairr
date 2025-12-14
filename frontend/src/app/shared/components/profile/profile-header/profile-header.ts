import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgIf } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { EditProfilePopup } from '../edit-profile-popup/edit-profile-popup';
import { UserService } from '../../../../core/services/user.service';
import { FlurrsService } from '../../../../core/services/flurrs.service';

@Component({
  selector: 'app-profile-header',
  standalone: true,
  imports: [NgIf],
  templateUrl: './profile-header.html',
  styleUrls: ['./profile-header.css']
})
export class ProfileHeader implements OnChanges {
  @Input() profile: any | null = null;
  //@Input() spaceID: any | null = null;

  flurrsNumber: number = 0;

  constructor(
    private dialog: MatDialog,
    private userService: UserService,
    private flurrsService: FlurrsService
  ) {}

  async ngOnChanges(changes: SimpleChanges) {
    if (changes['profile'] && this.profile?.user_id) {
      await this.totalFlurrs();
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
    console.log({
      profile: this.profile,
      me: this.userService.currentUser(),
      isOwnProfile: this.isOwnProfile
    });


    return false;
  }


  formatFollowerCount(count: number | null | undefined): string {
    const c = count ?? 0;
    if (c >= 1_000_000) return (c / 1_000_000).toFixed(1) + 'M';
    if (c >= 1_000) return (c / 1_000).toFixed(1) + 'K';
    return String(c);
  }

  openEditProfileDialog() {
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
}
