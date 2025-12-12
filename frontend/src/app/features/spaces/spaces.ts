import { Component, ElementRef } from '@angular/core';
import { SpacesCard } from '../../shared/components/spaces-card/spaces-card';
import { FlurrCreationCard } from '../../shared/components/flurr-creation-card/flurr-creation-card';
import { CardPanel } from '../../shared/components/card-panel/card-panel';
import { Post } from '../../shared/components/post-components/post/post';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-spaces',
  imports: [
    SpacesCard,
    CardPanel,
    Post,
    NgIf
  ],
  templateUrl: './spaces.html',
  styleUrl: './spaces.css'
})
export class Spaces {
  constructor(private elementRef: ElementRef<HTMLElement>,private router: Router) {}

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
