// src/app/shared/components/mini-profile-card/mini-profile-card.ts
import { Component, OnInit, OnDestroy, effect } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';
import { UserService } from '../../../core/services/user.service';
import { ButtonModule } from 'primeng/button';
//import { Subscription } from 'rxjs';

@Component({
  selector: 'app-mini-profile-card',
  standalone: true,
  imports: [RouterLink,NgIf, ButtonModule, CommonModule],
  templateUrl: './mini-profile-card.html',
  styleUrls: ['./mini-profile-card.css']
})
export class MiniProfileCard implements OnInit, OnDestroy {
  
  // Computed stats that update when user changes
  flurrsCount: number = 0;
  followersCount: number = 0;
  followingCount: number = 0;
  isLoading: boolean = true;

  constructor(public userService: UserService) {
    // Use Angular effect to react to signal changes
    effect(() => {
      const user = this.userService.currentUser();
      console.log('Mini Profile Card - User changed:', user);
      this.updateCounts();
      this.isLoading = false;
    });
  }

  ngOnInit() {
    console.log('Mini Profile Card - Component initialized');
    // Initial update
    this.updateCounts();
  }

  ngOnDestroy() {
    // Cleanup if needed
  }

  private updateCounts() {
    const user = this.userService.currentUser?.();
    
    if (!user) {
      console.log('Mini Profile Card - No user found');
      this.flurrsCount = 0;
      this.followersCount = 0;
      this.followingCount = 0;
      return;
    }

    // Count flurrs (posts)
    this.flurrsCount = Array.isArray(user.flurrs) ? user.flurrs.length : 0;
    
    // Count followers
    this.followersCount = Array.isArray(user.followers) ? user.followers.length : 0;
    
    // Count following
    this.followingCount = Array.isArray(user.following) ? user.following.length : 0;

    console.log('Mini Profile Card - Stats updated:', {
      flurrs: this.flurrsCount,
      followers: this.followersCount,
      following: this.followingCount,
      rawData: {
        flurrs: user.flurrs,
        followers: user.followers,
        following: user.following
      }
    });
  }

  formatFollowerCount(count: number | undefined | null): string {
    const c = count ?? 0;
    if (c >= 1_000_000) return (c / 1_000_000).toFixed(1) + 'M';
    if (c >= 1_000) return (c / 1_000).toFixed(1) + 'K';
    return String(c);
  }

  // Getter methods for template (always fresh)
  get displayFlurrsCount(): string {
    return this.formatFollowerCount(this.flurrsCount);
  }

  get displayFollowersCount(): string {
    return this.formatFollowerCount(this.followersCount);
  }

  get displayFollowingCount(): string {
    return this.formatFollowerCount(this.followingCount);
  }
}
