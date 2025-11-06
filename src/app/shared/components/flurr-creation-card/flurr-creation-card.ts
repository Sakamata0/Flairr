import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
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
import { JourneyCreationCardDialog } from '../journey-creation-card/journey-creation-card';



interface Journeys {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-flurr-creation-card',
  standalone: true,
  templateUrl: './flurr-creation-card.html',
  styleUrls: ['./flurr-creation-card.css'],
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class FlurrCreationCard {
  readonly dialog = inject(MatDialog);

  // method that opens the dialog
  openFlurrCreationDialog(): void {
    const dialogRef = this.dialog.open(FlurrCreationCardDialog, {
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
  selector: 'app-flurr-creation-card-dialog',
  standalone: true,
  templateUrl: './flurr-creation-card-dialog.html',
  styleUrls: ['./flurr-creation-card.css'],
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
  ],
})
// Dialog component class
export class FlurrCreationCardDialog {
  // --- Injected dependencies ---
  readonly dialogRef = inject(MatDialogRef<FlurrCreationCardDialog>);
  private readonly dialog = inject(MatDialog);

  // --- UI state variables ---
  username: string = 'Ismail Mechkene';
  selectedPrivacy: string = 'public';
  selectedJourney: string = '';
  flurrContent: string = ''; 

  // --- Static data ---
  journeys: Journeys[] = [
    { value: 'journey-1', viewValue: 'ToDo App' },
    { value: 'journey-2', viewValue: 'Recipe App' },
    { value: 'journey-3', viewValue: 'Flurr Website' },
  ];

  // --- Methods ---
  onNoClick(): void {
    this.dialogRef.close();
  }

  openJourneyCreationDialog(): void {
    this.onNoClick();
    this.dialog.open(JourneyCreationCardDialog, {
      panelClass: 'custom-journey-creation-dialog',
    }); 
  }
}
