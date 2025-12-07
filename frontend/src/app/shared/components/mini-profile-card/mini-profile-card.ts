// src/app/shared/components/mini-profile-card/mini-profile-card.ts
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-mini-profile-card',
  standalone: true,
  imports: [RouterLink,NgIf],
  templateUrl: './mini-profile-card.html',
  styleUrls: ['./mini-profile-card.css']
})
export class MiniProfileCard {
  constructor(public userService: UserService) {
      console.log("MiniCard user = ", this.userService.currentUser());


  }

  formatFollowerCount(count: number | undefined | null): string {
    const c = count ?? 0;
    if (c >= 1_000_000) return (c / 1_000_000).toFixed(1) + 'M';
    if (c >= 1_000) return (c / 1_000).toFixed(1) + 'K';
    return String(c);
  }


}
