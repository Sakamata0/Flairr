import { NgFor } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-friends-options',
  imports: [NgFor],
  templateUrl: './friends-options.html',
  styleUrl: './friends-options.css'
})
export class FriendsOptions {
  friendsOpTypes = [
    { key: 0, name: 'Follow Request', iconUrl: '/assets/icons/friends/follow-request.png', activeIconUrl: '/assets/icons/friends/follow-request_a.png' },
    { key: 1, name: 'Suggestions', iconUrl: '/assets/icons/friends/suggestions.png', activeIconUrl: '/assets/icons/friends/suggestions_a.png' },
    { key: 2, name: 'All Followers', iconUrl: '/assets/icons/friends/all-followers.png', activeIconUrl: '/assets/icons/friends/all-followers_a.png' },
    { key: 3, name: 'All Following', iconUrl: '/assets/icons/friends/all-following.png', activeIconUrl: '/assets/icons/friends/all-following_a.png' },
  ];
  activefriendsOpTypesKey = 0;
  setActivefriendsOpTypes(key: number) {
    this.activefriendsOpTypesKey = key;
  }
}
