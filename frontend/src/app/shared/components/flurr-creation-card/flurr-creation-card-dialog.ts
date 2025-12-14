import { CommonModule, NgFor, NgIf } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import {
  MatDialog,
  MatDialogActions,
  MatDialogContent,
  MatDialogModule,
  MatDialogRef,
  MatDialogTitle,
} from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { ToastModule } from "primeng/toast";
//import { FileUploadModule, FileUploadEvent } from "primeng/fileupload";
import { MessageService } from "primeng/api";
import { FileUpload } from 'primeng/fileupload';

import { JourneysService } from "../../../core/services/journeys.service";
import { FlurrsService } from "../../../core/services/flurrs.service";
import { UserService } from "../../../core/services/user.service";
import { JourneyCreationCardDialog } from "../journey-creation-card/journey-creation-card";
import { ButtonModule } from "primeng/button";

@Component({
  selector: 'app-flurr-creation-card-dialog',
  standalone: true,
  templateUrl: './flurr-creation-card-dialog.html',
  styleUrls: ['./flurr-creation-card.css'],
  imports: [
    CommonModule,
    NgIf,
    NgFor,
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FileUpload,
    ToastModule,
    ButtonModule
  ],
  providers: [MessageService]
})
export class FlurrCreationCardDialog {
  // File Upload
  uploadedFiles: File[] = [];
  // Injected services
  private journeysService = inject(JourneysService);
  private flurrService = inject(FlurrsService);
  private messageService = inject(MessageService);
  private dialog = inject(MatDialog);
  readonly dialogRef = inject(MatDialogRef<FlurrCreationCardDialog>);

  // User info
  user = inject(UserService).currentUser;

  // Form model
  model = {
    selectedPrivacy: "public",
    selectedJourneyId: null as string | null,
    flurrContent: ""
  };

  journeys = signal<{ id: string; name: string }[]>([]);

  submitted = false;

  async ngOnInit() {
    const journeyList = await this.journeysService.getCurrentUserJourneys();
    const mapped = journeyList.map(j => ({ id: j.journey_id, name: j.journey_name }));
    this.journeys.set(mapped);
  }

  onFileSelect(event: any) {
    for (const file of event.files) {
      this.uploadedFiles.push(file);
    }
  }


  // Open Journey creation dialog
  openJourneyCreationDialog() {
    this.dialog.open(JourneyCreationCardDialog, { panelClass: 'custom-journey-creation-dialog' });
    this.dialogRef.close();
  }

  // Submit Flurr
  isSubmitting = false;
  async onSubmit() {
    // startoooo 
    if (this.isSubmitting) return;
    this.isSubmitting = true;

    if (!this.model.flurrContent) return;

    try {
      //  Insert flurr
      const flurr = await this.flurrService.insertFlurr(
        'flurr',
        this.model.flurrContent,
        this.model.selectedJourneyId!
      );

      if (!flurr) return;

      // Upload files + insert records
      for (const file of this.uploadedFiles) {
        const uploaded = await this.flurrService.uploadFlurrFile(
          flurr.flurr_id,
          file
        );

        await this.flurrService.insertFlurrFileRecord(
          flurr.flurr_id,
          uploaded.url,
          uploaded.type
        );
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
      this.isSubmitting = false
    }
  }


  onNoClick() {
    this.dialogRef.close();
  }
}
