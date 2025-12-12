// Dialog component content

import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatDialog, MatDialogActions, MatDialogContent, MatDialogModule, MatDialogRef, MatDialogTitle } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { JourneyCreationCardDialog } from "../journey-creation-card/journey-creation-card";
import { UserService } from "../../../core/services/user.service";
import { Flurr } from "../../model/classes/flurrs";
import { JourneysService } from "../../../core/services/journeys.service";
import { FlurrsService } from "../../../core/services/flurrs.service";


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

  constructor(private journeysService: JourneysService, 
  private flurrService: FlurrsService) {}

  // --- Injected dependencies ---
  readonly dialogRef = inject(MatDialogRef<FlurrCreationCardDialog>);
  private readonly dialog = inject(MatDialog);

  // inject username 
  user = inject(UserService).currentUser
  newFlurr?: Flurr;

  // --- Flurr creation form ---
  model = {
    selectedPrivacy: "public",
    selectedJourneyId: null,
    flurrContent: ""
  };
  
  journeys = signal<{id: string, name: string}[]>([]);

  async ngOnInit() {
    const journeyList = await this.journeysService.getCurrentUserJourneys();
    const names = journeyList.map(j => ({ id: j.journey_id , name: j.journey_name }))
    this.journeys.set(names)
  }

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
  async onSubmit() {
    this.submitted = true;

    const journeyId = this.model.selectedJourneyId;
    console.log('id of journey : ', journeyId)

    try {
      const data = await this.flurrService.insertFlurr(
        "flurr",
        this.model.flurrContent,
        journeyId!
      );

      console.log('Flurr inserted:', data);
      this.dialogRef.close();
    } catch(err) {
      console.error('Error inserting Flurr:', err);
    }
  }

}