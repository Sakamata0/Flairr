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
  selector: 'app-friends-suggestions',
  standalone: true,
  imports: [
    FriendRequest,
    FriendsOptions,
    NgIf,
    NgFor
  ],
  templateUrl: './friends-suggestions.html',
  styleUrl: './friends-suggestions.css'
})
export class friendsSuggestions {
  
  constructor(private elementRef: ElementRef<HTMLElement>) {}

  friendRequests: profileInfo[] = [
    { username: 'Ismail Mechkene', firstName: "", lastName:"", followersCount: 1200, followingCount: 150, postsCount: 15 },
    { username: 'Skander Boughnimi', firstName: "", lastName:"", followersCount: 4700, followingCount: 320, postsCount: 58 },
    { username: 'Amine Dev', firstName: "", lastName:"", followersCount: 10900, followingCount: 410, postsCount: 132 },
    { username: 'Ja3fer', firstName: "", lastName:"", followersCount: 16000, followingCount: 510, postsCount: 201 },
    { username: 'Noura', firstName: "", lastName:"", followersCount: 2300, followingCount: 120, postsCount: 22 },
    { username: 'Hana', firstName: "", lastName:"", followersCount: 900, followingCount: 80, postsCount: 9 }
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
