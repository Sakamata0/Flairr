import { Component } from '@angular/core';
import { ChangeDetectionStrategy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialog,
  MatDialogModule,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { Space } from '../../model/classes/space';
import { UserService } from '../../../core/services/user.service';


@Component({
  selector: 'app-space-creation-card',
  standalone: true,
  templateUrl: './space-creation-card.html',
  styleUrls: ['./space-creation-card.css'],
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class SpaceCreationCard {
  readonly dialog = inject(MatDialog);

  // method that opens the dialog
  openSpaceCreationDialog(): void {
    const dialogRef = this.dialog.open(SpaceCreationCardDialog, {
      panelClass: 'custom-flurr-creation-dialog',
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('Dialog closed');
    });
  }
}

// Dialog component content
// Definition of the dialog component
@Component({
  selector: 'app-space-creation-card-dialog',
  standalone: true,
  templateUrl: './space-creation-card-dialog.html',
  styleUrls: ['./space-creation-card.css'],
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatSelectModule,
    FormsModule
  ],
})
// Dialog component class
export class SpaceCreationCardDialog {

  // validator, yay !!!
  validateCollaborators(input: string): string[] | null {
    if (!input) return []; // optional, empty is allowed

    // Split by commas, trim spaces
    const emails = input.split(',').map(e => e.trim());

    // Simple email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const invalidEmails = emails.filter(email => !emailRegex.test(email));

    if (invalidEmails.length) {
      console.error('Invalid emails:', invalidEmails);
      return null; // invalid input
    }

    return emails; // valid array
  }

  // --- Injected dependencies ---
  readonly dialogRef = inject(MatDialogRef<SpaceCreationCardDialog>);
  // inject username 
  user = inject(UserService).currentUser
  newSpace?: Space;
  
  // --- Journey creation form ---
  model = {
    selectedPrivacy: "public",
    spaceName: "",
    spaceBio: "",
    collaborators: ""
  };

  // --- Methods ---
  onNoClick(): void {
    this.dialogRef.close();
  }

  submitted: boolean = false;
  submit(): void {
    const collaboratorsArray = this.validateCollaborators(this.model.collaborators);
    if (collaboratorsArray === null) {
      // Stop submission, invalid email format
      return;
    }
    this.submitted = true;
    this.newSpace = new Space({
      spaceID: "space-" + crypto.randomUUID(),
      spaceName: this.model.spaceName,
      spaceBio: this.model.spaceBio,
      avatarImg: "assets/avatars/default.png", // default
      coverImg: "assets/covers/default.jpg",   // default
      dateCreated: new Date(),
      ownerID: this.user()?.userID,
      collaborators: collaboratorsArray
    });
    this.onNoClick();
    console.log("space: ",this.newSpace)
  }
}
