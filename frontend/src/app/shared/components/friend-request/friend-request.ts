import { Component, input, Output, EventEmitter } from '@angular/core';
import { FriendsProfile } from '../../model/friends-profile.type';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-friend-request',
  imports: [NgIf],
  standalone: true,
  templateUrl: './friend-request.html',
  styleUrl: './friend-request.css'
})
export class FriendRequest {
  info = input.required<FriendsProfile>();
  variab = input.required<number>();

  getHandle(name: string): string {
    return '@' + name.replace(' ', '_').toLowerCase();
  }

  onImageError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'assets/images/default-profile-picture.png';
  }
  onBannerError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'assets/images/default-banner-image.png';
  }

  @Output() accept = new EventEmitter<void>();
  @Output() follow = new EventEmitter<void>();
  @Output() remove = new EventEmitter<void>();


}
