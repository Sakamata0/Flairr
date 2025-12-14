import { Component, input, Output, EventEmitter } from '@angular/core';
import { FriendsProfile } from '../../model/friends-profile.type';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';

@Component({
    selector: 'app-friend-request',
    standalone: true,
    imports: [NgIf],
    templateUrl: './friend-request.html',
    styleUrl: './friend-request.css'
})
export class FriendRequest {

    info = input.required<FriendsProfile>();
    variab = input.required<number>();

    @Output() accept = new EventEmitter<void>();
    @Output() follow = new EventEmitter<void>();
    @Output() reject = new EventEmitter<void>();
    @Output() remove = new EventEmitter<void>(); // for suggestions / followers


    constructor(private router: Router) { }

    goToProfile() {
        this.router.navigate(['/profile', this.info().id]);
    }

    onImageError(event: Event) {
        (event.target as HTMLImageElement).src =
            'assets/images/default-profile-picture.png';
    }

    onBannerError(event: Event) {
        (event.target as HTMLImageElement).src =
            'assets/images/default-banner-image.png';
    }
}
