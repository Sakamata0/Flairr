import { Component, ElementRef } from '@angular/core';
import { FlurrCreationCard } from '../../shared/components/flurr-creation-card/flurr-creation-card';
import { FriendsOptions } from '../../shared/components/friends-options/friends-options';
import { MiniProfileCard } from '../../shared/components/mini-profile-card/mini-profile-card';
import { Post } from '../../shared/components/post-components/post/post';
import { ItemPanel } from '../../shared/components/item-panel/item-panel';
import { FriendRequest } from '../../shared/components/friend-request/friend-request';
import { profileInfo } from '../../shared/model/profile-info.type';

import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-friends',
  standalone: true,
  imports: [
    FriendRequest,
    FriendsOptions,
    NgIf,
    NgFor
  ],
  templateUrl: './friends.html',
  styleUrl: './friends.css'
})
export class Friends {
  
  constructor(private elementRef: ElementRef<HTMLElement>) {}

  friendRequests: profileInfo[] = [
    { username: 'Ismail Mechkene', followersCount: 1200, followingCount: 150, postsCount: 15 },
    { username: 'Skander Boughnimi', followersCount: 4700, followingCount: 320, postsCount: 58 },
    { username: 'Amine Dev', followersCount: 10900, followingCount: 410, postsCount: 132 },
    { username: 'Ja3fer', followersCount: 16000, followingCount: 510, postsCount: 201 },
    { username: 'Noura', followersCount: 2300, followingCount: 120, postsCount: 22 },
    { username: 'Hana', followersCount: 900, followingCount: 80, postsCount: 9 }
  ];

  shortcuts = [
      {id: '1', title: 'Web Developers Space', imageUrl: './assets/images/hama.png', withSubtitle: true, subtitle: '+1.5M Passionates', subtitleOnSameLevel: false, withIcon: false, withButton: true, buttonText: 'Visit', buttonAction: () => { console.log('Button clicked'); } },
      {id: '2', title: 'Angular Space', imageUrl: './assets/images/hama.png', withSubtitle: true, subtitle: '+800k Passionates', subtitleOnSameLevel: false, withIcon: false, withButton: true, buttonText: 'Visit', buttonAction: () => { console.log('Button clicked'); } },
      {id: '3', title: 'Artists Space', imageUrl: './assets/images/hama.png', withSubtitle: true, subtitle: '+2M Passionates', subtitleOnSameLevel: false, withIcon: false, withButton: true, buttonText: 'Visit', buttonAction: () => { console.log('Button clicked'); } }
  ];
  notifications = [
      {id: '4', title: 'Mohamed Houcine', imageUrl: './assets/images/hama.png', withSubtitle: true, subtitle: 'liked your Flurr!', subtitleOnSameLevel: true, withIcon: true, iconUrl: 'assets/icons/panel/like.png', withButton: false},
      {id: '5', title: 'Skander Boughnimi', imageUrl: '/assets/images/hama.png', withSubtitle: true, subtitle: 'commented on your Flurr!', subtitleOnSameLevel: true, withIcon: true, iconUrl: 'assets/icons/panel/comment.png', withButton: false}
  ];

  friendsSuggestions = [
    {id: '6', title: 'Amine Dev', imageUrl: './assets/images/hama.png', withSubtitle: true, subtitle: '10.9k Followers', subtitleOnSameLevel: false, withIcon: false, withButton: true, buttonText: 'Follow', buttonAction: () => { console.log('Button clicked'); } },
    {id: '7', title: 'Mohamed Houcine', imageUrl: './assets/images/hama.png', withSubtitle: true, subtitle: '2.5k Followers', subtitleOnSameLevel: false, withIcon: false, withButton: true, buttonText: 'Follow', buttonAction: () => { console.log('Button clicked'); } },
    {id: '8', title: 'Skander Boughnimi', imageUrl: './assets/images/hama.png', withSubtitle: true, subtitle: '4.7k Followers', subtitleOnSameLevel: false, withIcon: false, withButton: true, buttonText: 'Follow', buttonAction: () => { console.log('Button clicked'); } },
    {id: '8', title: 'Skander Boughnimi', imageUrl: './assets/images/hama.png', withSubtitle: true, subtitle: '4.7k Followers', subtitleOnSameLevel: false, withIcon: false, withButton: true, buttonText: 'Follow', buttonAction: () => { console.log('Button clicked'); } },
    {id: '8', title: 'Skander Boughnimi', imageUrl: './assets/images/hama.png', withSubtitle: true, subtitle: '4.7k Followers', subtitleOnSameLevel: false, withIcon: false, withButton: true, buttonText: 'Follow', buttonAction: () => { console.log('Button clicked'); } },
    {id: '9', title: 'Ja3fer', imageUrl: './assets/images/hama.png', withSubtitle: true, subtitle: '16k Followers', subtitleOnSameLevel: false, withIcon: false, withButton: true, buttonText: 'Follow', buttonAction: () => { console.log('Button clicked'); } }
  ];

  sortType: string = 'Top';
  sortingPostsMethodOpen: boolean = false;

  toggleSortingMethodMenu(ev?: Event) {
    ev?.stopPropagation();
    this.sortingPostsMethodOpen = !this.sortingPostsMethodOpen;
    const wrap = this.elementRef.nativeElement.querySelector('.sorting-posts-method-wrap');
    if (wrap) {
      wrap.classList.toggle('sorting-posts-method-open', this.sortingPostsMethodOpen);
    }
  }
}
