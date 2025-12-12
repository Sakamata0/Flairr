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
import { Flurr } from '../../model/classes/flurrs';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-space-flurr-creation-card',
  standalone: true,
  templateUrl: './space-flurr-creation-card.html',
  styleUrls: ['./space-flurr-creation-card.css'],
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class SpaceFlurrCreationCard {
  readonly dialog = inject(MatDialog);

  // method that opens the dialog
  openSpaceFlurrCreationDialog(): void {
    const dialogRef = this.dialog.open(SpaceFlurrCreationCardDialog, {
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
  selector: 'app-space-flurr-creation-card-dialog',
  standalone: true,
  templateUrl: './space-flurr-creation-card-dialog.html',
  styleUrls: ['./space-flurr-creation-card.css'],
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
export class SpaceFlurrCreationCardDialog {
  // --- Injected dependencies ---
  readonly dialogRef = inject(MatDialogRef<SpaceFlurrCreationCardDialog>);
  //private readonly dialog = inject(MatDialog);
  // inject username 
  user = inject(UserService).currentUser
  newSpaceFlurr?: Flurr;
  private currentSpaceID;
  private route = inject(ActivatedRoute);

  constructor() {
    // Read the `id` param from the route
    const id = this.route.snapshot.paramMap.get('spaceId'); 
    this.currentSpaceID = id; // combine
  }

  // --- UI state variables ---
  model = {
    flurrContent: ""
  };

  // --- Methods ---
  onNoClick(): void {
    this.dialogRef.close();
  }

  submitted=false;
  submit() : void {
    this.newSpaceFlurr =  new Flurr({
      flurrID: "flurr-" + crypto.randomUUID(),
      type: "space",
      content: this.model.flurrContent,
      privacy: "public",
      datePosted: new Date(),
      spaceID: this.currentSpaceID!,
      poster: this.user()?.userID
    });
    this.submitted = true;
    this.onNoClick();
    console.log("space-fluur",this.newSpaceFlurr); 
  }
}
