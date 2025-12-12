import { Component, Inject, input, signal } from '@angular/core';
import { profileInfo } from '../../../model/profile-info.type';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import { FormsModule} from '@angular/forms';

@Component({
  selector: 'app-edit-profile-popup',
  imports: [FormsModule],
  templateUrl: './edit-profile-popup.html',
  styleUrl: './edit-profile-popup.css'
})
export class EditProfilePopup {
  info = signal<profileInfo>({} as profileInfo);
  modifiableInfo: profileInfo;
  saveClicked: boolean = false;

  constructor(private dialogRef: MatDialogRef<EditProfilePopup>, @Inject(MAT_DIALOG_DATA) public data: profileInfo) {
    this.info.set(this.data);
    this.modifiableInfo = {...this.data};
    console.log(this.modifiableInfo);
  }

  animateSave() {
    this.saveClicked = true;
    setTimeout(() => this.saveClicked = false, 2000);
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
