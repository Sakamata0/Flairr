// Dialog component content

import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatDialog, MatDialogActions, MatDialogContent, MatDialogModule, MatDialogRef, MatDialogTitle } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { JourneyCreationCardDialog } from "../journey-creation-card/journey-creation-card";
import { Journey } from "../../model/classes/journey";
import { UserService } from "../../../core/services/user.service";
import { Flurr } from "../../model/classes/flurrs";

/*interface Journeys {
  id: string;
  journeyName: string;
}*/

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

  // inject username 
  user = inject(UserService).currentUser
  newFlurr?: Flurr;

  // --- Flurr creation form ---
  model = {
    selectedPrivacy: "public",
    selectedJourney: "",
    flurrContent: ""
  };

  journeys: Journey[] = [
    new Journey({
      journeyID: "journey-" + crypto.randomUUID(),
      journeyName: "ToDo App",
      dateCreated: new Date(),
      ownerID: this.user()?.userID,
      privacy: "public"
    }),
    new Journey({
      journeyID: "journey-" + crypto.randomUUID(),
      journeyName: "Recipe App",
      dateCreated: new Date(),
      ownerID: this.user()?.userID,
      privacy: "public"
    }),
    new Journey({
      journeyID: "journey-" + crypto.randomUUID(),
      journeyName: "Flurr Website",
      dateCreated: new Date(),
      ownerID: this.user()?.userID,
      privacy: "public"
    }),
  ]

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

  submitted = false;
  onSubmit() {
    this.submitted = true;

    this.newFlurr = new Flurr({
      flurrID: "flurr-" + crypto.randomUUID(),
      type: "journey",
      content: this.model.flurrContent,
      privacy: this.model.selectedPrivacy as "public" | "private" | "friends",
      datePosted: new Date(),
      journeyID: this.model.selectedJourney,
    });

    this.onNoClick();
    console.log("user: ", this.user());
    console.log("flurr created: ",this.newFlurr);
  }
}