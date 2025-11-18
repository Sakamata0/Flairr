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
import { Flurr } from "../../model/flurr-creation/flurr";
import { Journey } from "../../model/flurr-creation/journey";

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

  // --- UI state variables ---
  model: Flurr = new Flurr("", "Ismail Mechkene", "public", "", "");

  // --- Static data ---
  journeys: Journey[] = [
    new Journey('journey-1', "Ismail Mechkene", "public", "ToDo App"),
    new Journey('journey-2', "Ismail Mechkene", "public", "Recipe App"),
    new Journey('journey-3', "Ismail Mechkene", "public", "Flurr Website"),
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
    this.onNoClick();
    console.log("result: ",this.model);
  }
}