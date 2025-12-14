import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MatDialogModule, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MessageService } from 'primeng/api';

import { UserService } from '../../../core/services/user.service';
import { SpacesService } from '../../../core/services/spaces.service';
import { Space } from '../../model/classes/space';

@Component({
  selector: 'app-space-creation-card-dialog',
  standalone: true,
  templateUrl: './space-creation-card-dialog.html',
  styleUrls: ['./space-creation-card.css'],
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
    MatSelectModule
  ],
  providers: [MessageService]
})
export class SpaceCreationCardDialog {
  private dialogRef = inject(MatDialogRef<SpaceCreationCardDialog>);
  private messageService = inject(MessageService);
  private spacesService = inject(SpacesService);
  user = inject(UserService).currentUser;

  model = {
    selectedPrivacy: 'public',
    spaceName: '',
    spaceBio: '',
    collaborators: ''
  };

  submitted = false;
  isSubmitting = false;
  newSpace?: Space;

  // --- validate collaborator emails ---
  validateCollaborators(input: string): string[] | null {
    if (!input) return [];
    const emails = input.split(',').map(e => e.trim());
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalid = emails.filter(e => !emailRegex.test(e));
    return invalid.length ? null : emails;
  }

  onNoClick() {
    this.dialogRef.close();
  }

  async submit() {
    if (this.isSubmitting) return;
    this.isSubmitting = true;

    const collaborators = this.validateCollaborators(this.model.collaborators);
    if (collaborators === null) {
      this.messageService.add({
        severity: 'error',
        summary: 'Invalid emails',
        detail: 'Please enter valid email addresses separated by commas.'
      });
      this.isSubmitting = false;
      return;
    }

    if (!this.model.spaceName || !this.model.spaceBio) {
      this.messageService.add({
        severity: 'error',
        summary: 'Missing fields',
        detail: 'Space name and bio are required.'
      });
      this.isSubmitting = false;
      return;
    }

    try {
      const spaceId = await this.spacesService.insertSpace(this.model.spaceName, this.model.spaceBio);

      /*this.newSpace = {
        space_id: spaceId,
        space_name: this.model.spaceName,
        space_bio: this.model.spaceBio,
        avatar_img: null,
        cover_img: null,
        space_owner: this.user()?.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };*/

      this.messageService.add({
        severity: 'success',
        summary: 'Space created',
        detail: `Your space "${this.model.spaceName}" has been created!`
      });

      // handle collaborators here (optional)
      if (collaborators.length > 0) {
        console.log('Collaborators:', collaborators);
        // send invites logic
      }

      this.dialogRef.close(this.newSpace);

    } catch (err) {
      console.error(err);
      this.messageService.add({
        severity: 'error',
        summary: 'Creation failed',
        detail: 'Could not create space, please try again.'
      });
    } finally {
      this.isSubmitting = false;
    }
  }
}
