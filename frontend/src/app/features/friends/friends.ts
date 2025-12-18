import { Component, ElementRef, inject, OnInit } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';

import { FriendsOptions } from '../../shared/components/friends-options/friends-options';
import { FriendRequest } from '../../shared/components/friend-request/friend-request';
import { ConfirmDialog } from './confirm-dialog/confirm-dialog';

import { FriendsService } from '../../core/services/friends.service';
import { MessagingService } from '../../core/services/messaging.service';
import { Router, RouterModule } from '@angular/router';

@Component({
    selector: 'app-friends',
    standalone: true,
    imports: [
        FriendRequest,
        FriendsOptions,
        CommonModule,
        ConfirmDialog,
        RouterModule,
        NgIf
    ],
    templateUrl: './friends.html',
    styleUrl: './friends.css'
})
export class Friends implements OnInit {

    private friendsService = inject(FriendsService);
    private messagingService = inject(MessagingService);
    private currentUserId!: string;
    private router = inject(Router);
    loading: boolean = true;

    selectedType = 'Follow Request';
    key = 0;

    list$ = this.friendsService.friendRequests;

    // confirm dialog state
    confirmOpen = false;
    confirmMode: 'delete' | 'reject' | 'remove' | 'unfollow' | null = null;
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

        this.onFriendOptionSelected({ key: 0, name: 'Follow Request' });
        this.loading = false;
    }

    get confirmTitle(): string {
        switch (this.confirmMode) {
            case 'delete':
                return 'Remove suggestion';
            case 'reject':
                return 'Reject follow request';
            case 'remove':
                return 'Remove follower';
            case 'unfollow':
                return 'Unfollow user';
            default:
                return '';
        }
    }

    get confirmMessage(): string {
        switch (this.confirmMode) {
            case 'delete':
                return 'Are you sure you want to remove this user from your suggestions?';
            case 'reject':
                return 'Are you sure you want to reject this follow request?';
            case 'remove':
                return 'This user will no longer follow you. Are you sure?';
            case 'unfollow':
                return 'You will stop following this user. Are you sure?';
            default:
                return '';
        }
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
        await this.friendsService.sendFollowRequest(userId, this.currentUserId);
    }

    // ---------- (popup) DELETE (suggestion) ----------
    onDelete(userId: string) {
        this.userToActOn = userId;
        this.confirmMode = 'delete';
        this.confirmOpen = true;
    }

    // ---------- (popup) REJECT (follow request) ----------
    onReject(userId: string) {
        this.userToActOn = userId;
        this.confirmMode = 'reject';
        this.confirmOpen = true;
    }

    // ---------- (popup) REMOVE FOLLOWER ----------
    onRemoveFollower(userId: string) {
        this.userToActOn = userId;
        this.confirmMode = 'remove';
        this.confirmOpen = true;
    }

    // ---------- (popup) UNFOLLOW ----------
    onUnfollow(userId: string) {
        this.userToActOn = userId;
        this.confirmMode = 'unfollow';
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

        switch (this.confirmMode) {
            case 'delete':
                // For suggestions, just hide it from UI (it will reappear on next load if needed)
                // Or optionally reload suggestions to refresh the list
                await this.friendsService.loadSuggestions(this.currentUserId);
                break;

            case 'reject':
                await this.friendsService.rejectFollowRequest(
                    this.userToActOn,
                    this.currentUserId
                );
                break;

            case 'remove':
                await this.friendsService.removeFollower(
                    this.userToActOn,
                    this.currentUserId
                );
                break;

            case 'unfollow':
                await this.friendsService.unfollow(
                    this.userToActOn,
                    this.currentUserId
                );
                break;
        }

        this.resetConfirm();
    }

    onRemoveAction(userId: string) {
        this.userToActOn = userId;

        switch (this.key) {
            case 1: // Suggestions
                this.confirmMode = 'delete';
                break;

            case 2: // Followers
                this.confirmMode = 'remove';
                break;

            case 3: // Following
                this.confirmMode = 'unfollow';
                break;

            default:
                return;
        }

        this.confirmOpen = true;
    }

    onCancelAction() {
        this.resetConfirm();
    }

    private resetConfirm() {
        this.confirmOpen = false;
        this.confirmMode = null;
        this.userToActOn = null;
    }

    // ---------- OPEN CHAT ----------
    async openChat(userId: string) {
        const convoId = await this.friendsService.getOrCreateConversation(
            this.currentUserId,
            userId
        );

        this.router.navigate(['/messages', convoId]);
    }
}