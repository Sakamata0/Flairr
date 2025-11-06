import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialog,
  MatDialogModule,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';



export interface Journeys {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-journey-creation-card',
  standalone: true,
  templateUrl: './journey-creation-card.html',
  styleUrls: ['./journey-creation-card.css'],
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class JourneyCreationCard {
  readonly dialog = inject(MatDialog);

  // method that opens the dialog
  openJourneyCreationDialog(): void {
    const dialogRef = this.dialog.open(JourneyCreationCardDialog, {
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
  selector: 'app-journey-creation-card-dialog',
  standalone: true,
  templateUrl: './journey-creation-card-dialog.html',
  styleUrls: ['./journey-creation-card.css'],
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
    MatDialogClose,
    MatSelectModule,
    FormsModule
  ],
})
// Dialog component class
export class JourneyCreationCardDialog {
  // --- Injected dependencies ---
  readonly dialogRef = inject(MatDialogRef<JourneyCreationCardDialog>);
  
  // --- UI state variables ---
  username: string = 'Ismail Mechkene';
  selectedPrivacy: string = 'public';
  journeyName: string = ''; 
  journeyDescription: string = ''; 
  flurrContent: string = ''; 

  // --- Methods ---
  onNoClick(): void {
    this.dialogRef.close();
  }
}
