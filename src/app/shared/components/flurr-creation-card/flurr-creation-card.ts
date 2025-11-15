import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FlurrCreationCardDialog } from './flurr-creation-card-dialog';


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
    FlurrCreationCardDialog  
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
