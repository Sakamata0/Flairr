import { Component, input, Input } from '@angular/core';
import { profileInfo } from '../../../model/profile-info.type';
import { NgIf } from '@angular/common';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { EditProfilePopup } from '../edit-profile-popup/edit-profile-popup';

@Component({
  selector: 'app-profile-header',
  standalone: true,
  imports: [MatDialogModule, NgIf],
  templateUrl: './profile-header.html',
  styleUrls: ['./profile-header.css']
})

export class ProfileHeader {
  info = input<profileInfo>({
    username: '@ismail_.mechkene',
    firstName: 'Ismail',
    lastName: 'Mechkene',
    followersCount: 1_200_000,
    followingCount: 1_500,
    postsCount: 75,
    profileImageUrl: 'assets/images/profile-picture-test.jpg',
    bannerImageUrl: 'assets/images/banner-test.png',
    bio: "🌐 Developer | 📚 Learner | 🚀 Creator \n Building clean, responsive web apps. Always learning. Always improving. ✨",
    country: 'Tunisia',
    birthdate: '2004-11-05',
    email: 'ismail.mechkene@gmail.com'
  });

  constructor(private dialogRef: MatDialog) {}

  formatFollowerCount(count: number): string {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    }
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
  }

  openEditProfileDialog() {
    this.dialogRef.open(EditProfilePopup, 
      {
        width: '100vw',          // 90% of viewport width
        maxWidth: '700px',      // but no more than 600px
        height: 'auto',         // adapt height to content
        maxHeight: '90vh',      // max 90% of viewport height
        panelClass: 'edit-profile-dialog',
        autoFocus: false,
        data: this.info()
      });
  }
}
