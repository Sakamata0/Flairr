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
import { UserService } from '../../../core/services/user.service';
import { JourneysService } from '../../../core/services/journeys.service';
import { FileUpload } from 'primeng/fileupload';


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
    MatSelectModule,
    FormsModule,
    FileUpload,
  ],
})

// Dialog component class
export class JourneyCreationCardDialog {
  // File Upload
  //uploadedFiles: File[] = [];

  constructor(private journeysService: JourneysService) {}
  /*private flurrService = inject(FlurrsService);
  private messageService = inject(MessageService);*/

  // --- Injected dependencies ---
  readonly dialogRef = inject(MatDialogRef<JourneyCreationCardDialog>);
  // inject username 
  user = inject(UserService).currentUser
  
  // --- Journey creation form ---
  model = {
    selectedPrivacy: "public",
    journeyName: "",
    journeyDescription: "",
    //flurrContent: ""
  };
  
  // --- Methods ---
  onNoClick(): void {
      this.dialogRef.close();
    }

    submitted = false;
    isSubmitting = false
    async onSubmit() {
    this.isSubmitting = true;

    try {
      const newJourneyID = await this.journeysService
        .insertJourney(this.model.journeyName);

      console.log('Journey inserted:', newJourneyID);

      this.submitted = true;

      // CLOSE THE DIALOG
      this.dialogRef.close(newJourneyID); // you can pass data back if you want
    } finally {
      this.isSubmitting = false;
    }
  }

}