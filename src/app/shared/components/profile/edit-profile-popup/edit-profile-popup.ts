import { Component, Inject, input, Signal } from '@angular/core';
import { profileInfo } from '../../../model/profile-info.type';
import { MatDialog, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-edit-profile-popup',
  imports: [],
  templateUrl: './edit-profile-popup.html',
  styleUrl: './edit-profile-popup.css'
})
export class EditProfilePopup {

  constructor(private dialogRef: MatDialogRef<EditProfilePopup>) {}

  closeDialog(): void {
    this.dialogRef.close();
  }

  info = input<profileInfo>();
  
  afficher() {
    console.log(this.info()?.username);
  }
}
