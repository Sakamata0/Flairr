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
    NgFor
  ],
  templateUrl: './friends.html',
  styleUrl: './friends.css'
})
export class Friends {
  selectedType: string = 'Follow Request';
  key:number=0;

  
  
  constructor(private elementRef: ElementRef<HTMLElement>) {}
  
  

  onFriendOptionSelected(option: { key: number; name: string }) {
    this.selectedType = option.name;
    this.key=option.key; 
  }


  friendRequests: profileInfo[] = [
  {
    username: 'Ismail Mechkene',
    firstName: 'Ismail',
    lastName: 'Mechkene',
    profileImageUrl: '',
    bannerImageUrl: '',
    bio: 'Frontend engineer • Angular fan',
    followersCount: 1200,
    followingCount: 150,
    postsCount: 15,
    birthday: '1999-03-15',
    country: 'Tunisia'
  },
  {
    username: 'Skander Boughnimi',
    firstName: 'Skander',
    lastName: 'Boughnimi',
    profileImageUrl: '',
    bannerImageUrl: '',
    bio: 'Fullstack developer',
    followersCount: 4700,
    followingCount: 320,
    postsCount: 58,
    country: 'Tunisia'
  },
  {
    username: 'Mohamed Houcine',
    firstName: 'Mohamed',
    lastName: 'Houcine',
    profileImageUrl: '/assets/images/hama.png',
    bannerImageUrl: '/assets/images/banner-test.png',
    bio: 'Fullstack developer',
    followersCount: 4700,
    followingCount: 320,
    postsCount: 58,
    country: 'Tunisia'
  }
];

friendsSuggestions: profileInfo[] = [
  {
    username: 'Amine Dev',
    firstName: 'Amine',
    lastName: 'Dev',
    profileImageUrl: '/assets/images/profiles/amine.png',
    bannerImageUrl: '/assets/images/banners/banner3.png',
    bio: 'Backend & infrastructure',
    followersCount: 10900,
    followingCount: 410,
    postsCount: 132,
    birthday: '1996-05-21',
    country: 'Tunisia'
  },
  {
    username: 'Noura',
    firstName: 'Noura',
    lastName: '',
    profileImageUrl: '/assets/images/profiles/noura.png',
    bio: 'Photographer & designer',
    followersCount: 2300,
    followingCount: 120,
    postsCount: 22,
    country: 'Tunisia'
  },
  {
    username: 'Ali Mansour',
    firstName: 'Ali',
    lastName: 'Mansour',
    profileImageUrl: '/assets/images/profiles/ali.png',
    bio: 'Digital artist & illustrator',
    followersCount: 900,
    followingCount: 80,
    postsCount: 9,
    country: 'Tunisia'
  }
];

followers: profileInfo[] = [
  {
    username: 'Yassine Bouhlel',
    firstName: 'Yassine',
    lastName: 'Bouhlel',
    profileImageUrl: '/assets/images/profiles/yassine.png',
    bio: 'Computer science student',
    followersCount: 540,
    followingCount: 230,
    postsCount: 9,
    birthday: '2001-08-10',
    country: 'Tunisia'
  },
  {
    username: 'Sara Ben Slimane',
    firstName: 'Sara',
    lastName: 'Ben Slimane',
    profileImageUrl: '/assets/images/profiles/sara.png',
    bio: 'UI designer & artist',
    followersCount: 800,
    followingCount: 100,
    postsCount: 24,
    country: 'Tunisia'
  },
  {
    username: 'Zied Amri',
    firstName: 'Zied',
    lastName: 'Amri',
    profileImageUrl: '/assets/images/profiles/zied.png',
    bio: 'UX researcher and writer',
    followersCount: 6200,
    followingCount: 500,
    postsCount: 92,
    country: 'Tunisia'
  }
];

following: profileInfo[] = [
  {
    username: 'Mohamed Houcine',
    firstName: 'Mohamed',
    lastName: 'Houcine',
    profileImageUrl: '/assets/images/profiles/mohamed.png',
    bio: 'Mobile & game developer',
    followersCount: 2500,
    followingCount: 180,
    postsCount: 45,
    birthday: '1998-12-01',
    country: 'Tunisia'
  },
  {
    username: 'Lina Trabelsi',
    firstName: 'Lina',
    lastName: 'Trabelsi',
    profileImageUrl: '/assets/images/profiles/lina.png',
    bio: 'Frontend developer • JS lover',
    followersCount: 1400,
    followingCount: 300,
    postsCount: 33,
    country: 'Tunisia'
  },
  {
    username: 'Ahmed Nasri',
    firstName: 'Ahmed',
    lastName: 'Nasri',
    profileImageUrl: '/assets/images/profiles/ahmed.png',
    bio: 'Cloud & DevOps Engineer',
    followersCount: 5800,
    followingCount: 600,
    postsCount: 75,
    country: 'Tunisia'
  }
];




  get currentList() {
    switch (this.selectedType) {
      case 'Follow Request':
        return this.friendRequests;
      case 'Suggestions':
        return this.friendsSuggestions;
      case 'All Followers':
        return this.followers;
      case 'All Following':
        return this.following;
      default:
        return this.friendRequests;
    }
  }

  DisplayedArray=this.currentList;


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




private removeFromSource(item: profileInfo, source: string) {
  const username = item.username;
  switch ((source || '').toLowerCase()) {
    case 'follow request':
    case 'follow requests':
    case 'followrequest':
    case 'requests':
      this.friendRequests = this.friendRequests.filter(u => u.username !== username);
      break;
    case 'suggestions':
      this.friendsSuggestions = this.friendsSuggestions.filter(u => u.username !== username);
      break;
    case 'all followers':
    case 'followers':
      this.followers = this.followers.filter(u => u.username !== username);
      break;
    case 'all following':
    case 'following':
      this.following = this.following.filter(u => u.username !== username);
      break;
    default:
      this.friendRequests = this.friendRequests.filter(u => u.username !== username);
      this.friendsSuggestions = this.friendsSuggestions.filter(u => u.username !== username);
      this.followers = this.followers.filter(u => u.username !== username);
      this.following = this.following.filter(u => u.username !== username);
      break;
  }
}

private addToFollowers(item: profileInfo) {
  const exists = this.followers.some(u => u.username === item.username);
  if (!exists) {
    // optionally, you might want to clone to avoid accidental object reuse
    this.followers = [ { ...item }, ...this.followers ];
  }
}

onAccept(item: profileInfo, source: string) {
  this.addToFollowers(item);
  this.removeFromSource(item, source);
}

onFollow(item: profileInfo, source: string) {
  this.addToFollowers(item);
  this.removeFromSource(item, source);
}

onRemove(item: profileInfo, source: string) {
  this.removeFromSource(item, source);
}



}
