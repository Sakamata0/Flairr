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
import { Journey } from '../../model/classes/journey';
import { UserService } from '../../../core/services/user.service';
import { Flurr } from '../../model/classes/flurrs';


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
    FormsModule
  ],
})
// Dialog component class
export class JourneyCreationCardDialog {
  // --- Injected dependencies ---
  readonly dialogRef = inject(MatDialogRef<JourneyCreationCardDialog>);
  // inject username 
  user = inject(UserService).currentUser
  newJourney?: Journey;
  
  // --- Journey creation form ---
  model = {
    selectedPrivacy: "public",
    journeyName: "",
    journeyDescription: "",
    flurrContent: ""
  };
  
  // --- Methods ---
  onNoClick(): void {
    this.dialogRef.close();
  }
  submitted = false;
  onSubmit() {
    const newJourneyID = "journey-" + crypto.randomUUID()

    const firstFlurr = new Flurr({
      flurrID: "flurr-" + crypto.randomUUID(),
      type: "journey",
      content: this.model.flurrContent,
      privacy: this.model.selectedPrivacy as "public" | "private" | "friends",
      datePosted: new Date(),
      journeyID: newJourneyID,
    });

    // journey created
    this.newJourney = new Journey({
      journeyID: newJourneyID,
      journeyName: this.model.journeyName,
      dateCreated: new Date(),
      journeyDescription: this.model.journeyDescription,
      ownerID: this.user()?.userID,
      privacy: this.model.selectedPrivacy as "public" | "private" | "friends",
      fluurs: [firstFlurr.getFlurrID()]
    }),

    this.submitted = true;
    console.log("Created journey:", this.newJourney);
    this.dialogRef.close();
  }

}
