import { Component, Inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { supabase } from '../../../../core/supabase/supabase.client';
import { UserService } from '../../../../core/services/user.service';

// Define the profile info interface locally if it doesn't exist
export interface ProfileInfo {
  fullName?: string;
  bio?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  email?: string;
}

@Component({
  selector: 'app-edit-profile-popup',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './edit-profile-popup.html',
  styleUrl: './edit-profile-popup.css'
})
export class EditProfilePopup {
  info = signal<ProfileInfo>({} as ProfileInfo);
  modifiableInfo: ProfileInfo;
  saveClicked: boolean = false;
  isSaving: boolean = false;
  errorMessage: string = '';

  constructor(
    private dialogRef: MatDialogRef<EditProfilePopup>,
    @Inject(MAT_DIALOG_DATA) public data: ProfileInfo,
    private userService: UserService
  ) {
    this.info.set(this.data);
    this.modifiableInfo = { ...this.data };
    console.log('Edit Profile - Initial data:', this.modifiableInfo);
  }

  async saveProfile() {
    this.isSaving = true;
    this.errorMessage = '';

    try {
      // Get current user ID
      const uid = await this.getCurrentUid();
      if (!uid) {
        this.errorMessage = 'You must be logged in to edit your profile.';
        this.isSaving = false;
        return;
      }

      // Prepare update data (only fields that can be edited)
      const updates: any = {
        updated_at: new Date().toISOString()
      };

      // Only include fields that have been modified
      if (this.modifiableInfo.fullName !== this.data.fullName) {
        updates.full_name = this.modifiableInfo.fullName;
      }
      if (this.modifiableInfo.bio !== this.data.bio) {
        updates.bio = this.modifiableInfo.bio;
      }
      if (this.modifiableInfo.avatarUrl !== this.data.avatarUrl) {
        updates.avatar_img = this.modifiableInfo.avatarUrl;
      }
      if (this.modifiableInfo.bannerUrl !== this.data.bannerUrl) {
        updates.cover_img = this.modifiableInfo.bannerUrl;
      }

      console.log('Saving profile updates:', updates);

      // Update in Supabase
      const { data: updatedUser, error } = await supabase
        .from('users')
        .update(updates)
        .eq('user_id', uid)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        this.errorMessage = 'Failed to update profile. Please try again.';
        this.isSaving = false;
        return;
      }

      console.log('Profile updated successfully:', updatedUser);

      // Update UserService with new data
      await this.userService.loadUserById(uid);

      // Animate save button
      this.animateSave();

      // Close dialog and return updated data after animation
      setTimeout(() => {
        this.dialogRef.close(this.modifiableInfo);
      }, 1000);

    } catch (err) {
      console.error('Unexpected error saving profile:', err);
      this.errorMessage = 'An unexpected error occurred.';
      this.isSaving = false;
    }
  }

  private async getCurrentUid(): Promise<string | null> {
    try {
      // Try to get from UserService first
      const user = this.userService.currentUser?.();
      if (user && (user as any).userID) {
        return (user as any).userID;
      }
    } catch (e) {
      console.warn('Could not get user from UserService');
    }

    try {
      // Fallback to Supabase auth
      const { data } = await supabase.auth.getSession();
      return data.session?.user?.id ?? null;
    } catch (err) {
      console.error('Error getting user session:', err);
      return null;
    }
  }

  animateSave() {
    this.saveClicked = true;
    setTimeout(() => this.saveClicked = false, 2000);
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  // Helper method to handle image upload (optional - if you want to add image upload)
  async uploadImage(file: File, type: 'avatar' | 'cover'): Promise<string | null> {
    try {
      const uid = await this.getCurrentUid();
      if (!uid) return null;

      const fileExt = file.name.split('.').pop();
      const fileName = `${uid}-${type}-${Date.now()}.${fileExt}`;
      const filePath = `${type}s/${fileName}`;

      const { data, error } = await supabase.storage
        .from('profile-images') // Make sure this bucket exists in Supabase Storage
        .upload(filePath, file);

      if (error) {
        console.error('Error uploading image:', error);
        return null;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (err) {
      console.error('Unexpected error uploading image:', err);
      return null;
    }
  }
}