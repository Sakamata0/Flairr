import { ChangeDetectionStrategy, Component, Input, inject, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialog,
  MatDialogModule,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
  MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../core/services/user.service';
import { FileUpload } from 'primeng/fileupload';
import { MessageService } from 'primeng/api';
import { FlurrsService } from '../../../core/services/flurrs.service';

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
  user = inject(UserService).currentUser;

  /** Space ID passed from parent component */
  @Input() currentSpaceID!: string;

  openSpaceFlurrCreationDialog(): void {
    const dialogRef = this.dialog.open(SpaceFlurrCreationCardDialog, {
      panelClass: 'custom-flurr-creation-dialog',
      data: { spaceId: this.currentSpaceID } // Pass the space ID to the dialog
    });

    dialogRef.afterClosed().subscribe(() => console.log('Dialog closed'));
  }
}

// -------------------- Dialog Component --------------------
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
    FileUpload,
  ],
  providers: [MessageService]
})
export class SpaceFlurrCreationCardDialog {
  uploadedFiles: File[] = [];
  model = { flurrContent: '' };
  isSubmitting = false;

  readonly dialogRef = inject(MatDialogRef<SpaceFlurrCreationCardDialog>);
  private flurrService = inject(FlurrsService);
  private messageService = inject(MessageService);
  user = inject(UserService).currentUser;

  /** Correctly receive space ID from parent via MAT_DIALOG_DATA */
  private currentSpaceID: string;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { spaceId: string }) {
    this.currentSpaceID = data.spaceId;
  }

  onFileSelect(event: any) {
    this.uploadedFiles.push(...event.files);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  async onSubmit() {
    if (this.isSubmitting || !this.model.flurrContent) return;

    this.isSubmitting = true;

    try {
      // Insert Flurr with correct space_id
      const flurr = await this.flurrService.insertFlurr(
        'space',
        this.model.flurrContent,
        undefined,           // no journey
        this.currentSpaceID  // correct space ID
      );

      if (!flurr) return;

      // Upload files + insert file records
      for (const file of this.uploadedFiles) {
        const uploaded = await this.flurrService.uploadFlurrFile(flurr.flurr_id, file);
        await this.flurrService.insertFlurrFileRecord(flurr.flurr_id, uploaded.url, uploaded.type);
      }

      this.messageService.add({
        severity: 'success',
        summary: 'Flurr created',
        detail: 'Flurr and files uploaded'
      });

      this.dialogRef.close();

    } catch (err) {
      console.error(err);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to create flurr'
      });
    } finally {
      this.isSubmitting = false;
    }
  }
}

