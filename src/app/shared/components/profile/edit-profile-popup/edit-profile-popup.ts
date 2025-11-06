import { Component, Inject, input, signal } from '@angular/core';
import { profileInfo } from '../../../model/profile-info.type';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import { NgIf } from '@angular/common';
import { FormsModule} from '@angular/forms';

@Component({
  selector: 'app-edit-profile-popup',
  imports: [NgIf, FormsModule],
  templateUrl: './edit-profile-popup.html',
  styleUrl: './edit-profile-popup.css'
})
export class EditProfilePopup {
  info = signal<profileInfo>({} as profileInfo);
  editingBio: boolean = false;
  bioText: string = this.info().bio || '';

  constructor(private dialogRef: MatDialogRef<EditProfilePopup>, @Inject(MAT_DIALOG_DATA) public data: profileInfo) {
    this.info.set(this.data);
  }

  closeDialog(): void {
    this.dialogRef.close();
    this.editingBio = false;
  }

  ngOnChanges() {
    this.info.update(val => ({...val, bio: this.bioText}) );
  }
}
