// edit-profile-popup.ts - WITH IMAGE UPLOAD FUNCTIONALITY
import { Component, Inject, signal, ViewChild, ElementRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { supabase } from '../../../../core/supabase/supabase.client';
import { UserService } from '../../../../core/services/user.service';

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
  @ViewChild('avatarInput') avatarInput!: ElementRef<HTMLInputElement>;
  @ViewChild('bannerInput') bannerInput!: ElementRef<HTMLInputElement>;

  info = signal<ProfileInfo>({} as ProfileInfo);
  modifiableInfo: ProfileInfo;
  saveClicked: boolean = false;
  isSaving: boolean = false;
  isUploadingAvatar: boolean = false;
  isUploadingBanner: boolean = false;
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

  // Trigger file input for avatar
  triggerAvatarUpload() {
    if (this.isUploadingAvatar || this.isSaving) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => this.handleAvatarUpload(e.target.files[0]);
    input.click();
  }

  // Trigger file input for banner
  triggerBannerUpload() {
    if (this.isUploadingBanner || this.isSaving) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => this.handleBannerUpload(e.target.files[0]);
    input.click();
  }

  // Handle avatar upload
  async handleAvatarUpload(file: File | null) {
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      this.errorMessage = 'Please select an image file';
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      this.errorMessage = 'Image must be smaller than 5MB';
      return;
    }

    this.isUploadingAvatar = true;
    this.errorMessage = '';

    try {
      const url = await this.uploadImage(file, 'avatar');
      if (url) {
        this.modifiableInfo.avatarUrl = url;
        console.log('Avatar uploaded:', url);
      } else {
        this.errorMessage = 'Failed to upload avatar';
      }
    } catch (err: any) {
      console.error('Error uploading avatar:', err);
      this.errorMessage = err?.message || 'Failed to upload avatar';
    } finally {
      this.isUploadingAvatar = false;
    }
  }

  // Handle banner upload
  async handleBannerUpload(file: File | null) {
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      this.errorMessage = 'Please select an image file';
      return;
    }

    // Validate file size (10MB max for banners)
    if (file.size > 10 * 1024 * 1024) {
      this.errorMessage = 'Image must be smaller than 10MB';
      return;
    }

    this.isUploadingBanner = true;
    this.errorMessage = '';

    try {
      const url = await this.uploadImage(file, 'cover');
      if (url) {
        this.modifiableInfo.bannerUrl = url;
        console.log('Banner uploaded:', url);
      } else {
        this.errorMessage = 'Failed to upload banner';
      }
    } catch (err: any) {
      console.error('Error uploading banner:', err);
      this.errorMessage = err?.message || 'Failed to upload banner';
    } finally {
      this.isUploadingBanner = false;
    }
  }

  // Upload image to Supabase Storage
  async uploadImage(file: File, type: 'avatar' | 'cover'): Promise<string | null> {
    try {
      // Verify authentication first
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError) {
        console.error('Auth error:', authError);
        throw new Error('Authentication error: ' + authError.message);
      }
      
      if (!session) {
        throw new Error('You must be logged in to upload images');
      }
      
      const uid = session.user.id;
      console.log('Authenticated user:', uid);

      // Generate unique filename
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${uid}-${type}-${Date.now()}.${fileExt}`;
      const filePath = `${type}s/${fileName}`;

      console.log('Upload details:', {
        bucket: 'profile-images',
        path: filePath,
        fileSize: file.size,
        fileType: file.type
      });

      // Delete old image if exists (optional - helps manage storage)
      const oldUrl = type === 'avatar' ? this.data.avatarUrl : this.data.bannerUrl;
      if (oldUrl && oldUrl.includes('supabase')) {
        try {
          const oldPath = this.extractPathFromUrl(oldUrl);
          if (oldPath) {
            const { error: deleteError } = await supabase.storage
              .from('profile-images')
              .remove([oldPath]);
            
            if (deleteError) {
              console.warn('Could not delete old image:', deleteError);
            } else {
              console.log('Deleted old image:', oldPath);
            }
          }
        } catch (err) {
          console.warn('Error deleting old image:', err);
        }
      }

      // Upload new image
      const { data, error } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error details:', {
          message: error.message,
          statusCode: (error as any).statusCode,
          name: (error as any).name,
          error: error
        });
        throw new Error('Upload failed: ' + error.message);
      }

      console.log('Upload successful:', data);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);

      console.log('Public URL generated:', urlData.publicUrl);
      return urlData.publicUrl;

    } catch (err: any) {
      console.error('Upload failed:', err);
      throw err;
    }
  }

  // Extract path from Supabase URL
  private extractPathFromUrl(url: string): string | null {
    try {
      const parts = url.split('/profile-images/');
      return parts.length > 1 ? parts[1] : null;
    } catch {
      return null;
    }
  }

  async saveProfile() {
    if (this.isSaving) return;

    this.isSaving = true;
    this.errorMessage = '';

    try {
      const currentUser = this.userService.currentUser();
      if (!currentUser) {
        this.errorMessage = 'You must be logged in to edit this profile.';
        this.isSaving = false;
        return;
      }

      const isUserProfile = !!(this.data as any).user_id;
      const isSpaceProfile = !!(this.data as any).space_id;

      const updates: any = {
        updated_at: new Date().toISOString()
      };

      // Add editable fields
      if (this.modifiableInfo.fullName?.trim()) updates.full_name = this.modifiableInfo.fullName.trim();
      if (this.modifiableInfo.bio !== undefined) updates.bio = this.modifiableInfo.bio?.trim() || null;
      if (this.modifiableInfo.avatarUrl !== undefined) updates.avatar_img = this.modifiableInfo.avatarUrl?.trim() || null;
      if (this.modifiableInfo.bannerUrl !== undefined) updates.cover_img = this.modifiableInfo.bannerUrl?.trim() || null;

      if (isUserProfile) {
        // Only allow editing if the user owns this profile
        if ((this.data as any).user_id !== currentUser.userID) {
          this.errorMessage = 'You cannot edit this user profile.';
          this.isSaving = false;
          return;
        }

        const { data: updatedUser, error } = await supabase
          .from('users')
          .update(updates)
          .eq('user_id', currentUser.userID)
          .select()
          .single();

        if (error) throw error;

        // Reload user in UserService
        await this.userService.loadUserById(currentUser.userID);

      } else if (isSpaceProfile) {
        // Only allow editing if the user is the space owner
        if ((this.data as any).space_owner !== currentUser.userID) {
          this.errorMessage = 'You cannot edit this space profile.';
          this.isSaving = false;
          return;
        }

        const { data: updatedSpace, error } = await supabase
          .from('spaces')
          .update({
            space_name: this.modifiableInfo.fullName?.trim() || undefined,
            space_bio: this.modifiableInfo.bio?.trim() || null,
            avatar_img: this.modifiableInfo.avatarUrl?.trim() || null,
            cover_img: this.modifiableInfo.bannerUrl?.trim() || null,
            updated_at: new Date().toISOString()
          })
          .eq('space_id', (this.data as any).space_id)
          .select()
          .single();

        if (error) throw error;

      } else {
        this.errorMessage = 'Invalid profile type.';
        this.isSaving = false;
        return;
      }

      // Animate save button
      this.animateSave();

      // Close dialog after short delay
      setTimeout(() => {
        this.dialogRef.close({
          success: true,
          data: this.modifiableInfo
        });
      }, 1000);

    } catch (err: any) {
      console.error('Error saving profile:', err);
      this.errorMessage = err?.message || 'An unexpected error occurred.';
      this.isSaving = false;
    }
  }



  private async getCurrentUid(): Promise<string | null> {
    try {
      // Try UserService first
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
    if (!this.isSaving && !this.isUploadingAvatar && !this.isUploadingBanner) {
      this.dialogRef.close(null);
    }
  }
}