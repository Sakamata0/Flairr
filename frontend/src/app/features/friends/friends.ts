import { Component, ElementRef, inject, OnInit } from '@angular/core';
import { FriendsOptions } from '../../shared/components/friends-options/friends-options';
import { FriendRequest } from '../../shared/components/friend-request/friend-request';

import { NgFor, NgIf } from '@angular/common';
import { FriendsService } from '../../core/services/friends.service';
import { MessagingService } from '../../core/services/messaging.service';

@Component({
    selector: 'app-friends',
    standalone: true,
    imports: [
        FriendRequest,
        FriendsOptions,
        NgFor
    ],
    templateUrl: './friends.html',
    styleUrl: './friends.css'
})
export class Friends implements OnInit {

    private friendsService = inject(FriendsService);
    private messagingService = inject(MessagingService);

    selectedType = 'Follow Request';
    key = 0;

    list$ = this.friendsService.suggestions;

    constructor(private elementRef: ElementRef<HTMLElement>) { }

    async ngOnInit() {
        const user = await this.messagingService.getCurrentUser();
        if (!user) return;

        await this.friendsService.loadSuggestions(user.id);
    }

    onFriendOptionSelected(option: { key: number; name: string }) {
        this.selectedType = option.name;
        this.key = option.key;

        switch (option.key) {
            case 0:
                this.list$ = this.friendsService.friendRequests;
                break;
            case 1:
                this.list$ = this.friendsService.suggestions;
                break;
            case 2:
                this.list$ = this.friendsService.followers;
                break;
            case 3:
                this.list$ = this.friendsService.following;
                break;
        }
    }

}
