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
    username: 'Skander Boughnimi',
    followersCount: 120,
    followingCount: 150,
    postsCount: 75,
    bio: "🌐 Developer | 📚 Learner | 🚀 Creator \n Building clean, responsive web apps. Always learning. Always improving. ✨"
  });

  constructor(private dialogRef: MatDialog) {

    
  }

  openEditProfileDialog() {
    this.dialogRef.open(EditProfilePopup, 
      {
        width: '750px',
        height: 'fit-content',
        maxWidth: '90vw',
        maxHeight: '80vh',
        panelClass: 'edit-profile-dialog',
        disableClose: true,
        data: this.info
      });
  }
}
