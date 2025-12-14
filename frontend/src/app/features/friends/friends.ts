import { Component, ElementRef, inject, OnInit } from '@angular/core';
import { NgFor } from '@angular/common';

import { FriendsOptions } from '../../shared/components/friends-options/friends-options';
import { FriendRequest } from '../../shared/components/friend-request/friend-request';
import { ConfirmDialog } from './confirm-dialog/confirm-dialog';

import { FriendsService } from '../../core/services/friends.service';
import { MessagingService } from '../../core/services/messaging.service';

@Component({
    selector: 'app-friends',
    standalone: true,
    imports: [
        FriendRequest,
        FriendsOptions,
        NgFor,
        ConfirmDialog
    ],
    templateUrl: './friends.html',
    styleUrl: './friends.css'
})
export class Friends implements OnInit {

    private friendsService = inject(FriendsService);
    private messagingService = inject(MessagingService);

    private currentUserId!: string;

    selectedType = 'Follow Request';
    key = 0;

    list$ = this.friendsService.suggestions;

    // confirm dialog state
    confirmOpen = false;
    confirmMode: 'delete' | 'reject' | null = null;
    userToActOn: string | null = null;

    constructor(private elementRef: ElementRef<HTMLElement>) { }

    async ngOnInit() {
        const user = await this.messagingService.getCurrentUser();
        if (!user) return;

        this.currentUserId = user.id;

        await Promise.all([
            this.friendsService.loadSuggestions(user.id),
            this.friendsService.loadFriendRequests(user.id),
            this.friendsService.loadFollowers(user.id),
            this.friendsService.loadFollowing(user.id),
        ]);
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

    async onFollow(userId: string) {
        const user = await this.messagingService.getCurrentUser();
        if (!user) return;

        await this.friendsService.sendFollowRequest(userId, user.id);
    }

    // ---------- DELETE (suggestion) ----------
    onDelete(userId: string) {
        this.userToActOn = userId;
        this.confirmMode = 'delete';
        this.confirmOpen = true;
    }

    // ---------- REJECT (follow request) ----------
    onReject(userId: string) {
        this.userToActOn = userId;
        this.confirmMode = 'reject';
        this.confirmOpen = true;
    }

    // ---------- ACCEPT ----------
    async onAccept(userId: string) {
        await this.friendsService.acceptFollowRequest(
            userId,
            this.currentUserId
        );
    }

    // ---------- CONFIRM HANDLER ----------
    async onConfirmAction() {
        if (!this.userToActOn || !this.confirmMode) return;

        if (this.confirmMode === 'delete') {
            this.friendsService.removeFromSuggestions(this.userToActOn);
        }

        if (this.confirmMode === 'reject') {
            await this.friendsService.rejectFollowRequest(
                this.userToActOn,
                this.currentUserId
            );
        }

        this.resetConfirm();
    }

    onCancelAction() {
        this.resetConfirm();
    }

    private resetConfirm() {
        this.confirmOpen = false;
        this.confirmMode = null;
        this.userToActOn = null;
    }
}
