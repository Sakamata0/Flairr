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
import { Space } from '../../model/flurr-creation/space';


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
  // --- Injected dependencies ---
  readonly dialogRef = inject(MatDialogRef<SpaceCreationCardDialog>);
  
  // --- UI state variables ---
  /*username: string = 'Ismail Mechkene';
  selectedPrivacy: string = 'public';
  spaceName: string = ''; 
  spaceInvitation: string = '';*/
  model: Space = new Space("","Ismail Mechkene","public","","");

  // --- Methods ---
  onNoClick(): void {
    this.dialogRef.close();
  }

  submitted: boolean = false;
  submit(): void {
    this.submitted = true;
    this.onNoClick();
    console.log("space: ",this.model)
  }
}
