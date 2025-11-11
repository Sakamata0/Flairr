import { Component, ElementRef } from '@angular/core';
import { ProfileHeader } from "../../shared/components/profile/profile-header/profile-header";
import { CardPanel } from "../../shared/components/card-panel/card-panel";
import { FlurrCreationCard } from "../../shared/components/flurr-creation-card/flurr-creation-card";
import { Post } from "../../shared/components/post-components/post/post";
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { JourneysSelector } from "../../shared/components/profile/journeys-selector/journeys-selector";

@Component({
  selector: 'app-profile',
  imports: [ProfileHeader, CardPanel, FlurrCreationCard, Post, NgIf, JourneysSelector],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile {
  constructor(private elementRef: ElementRef<HTMLElement>, private router: Router) {}

  FlairrSpaces = [
      {id: '1', title: 'Web Developers Space', imageUrl: './assets/images/hama.png', withSubtitle: true, subtitle: '+1.5M Passionates', subtitleOnSameLevel: false, withIcon: false, withButton: true, buttonText: 'Visit', buttonAction: () => {} },
      {id: '2', title: 'Angular Space', imageUrl: './assets/images/hama.png', withSubtitle: true, subtitle: '+800k Passionates', subtitleOnSameLevel: false, withIcon: false, withButton: true, buttonText: 'Visit', buttonAction: () => { console.log('Button clicked'); } },
      {id: '3', title: 'Graphic Designers Space', imageUrl: './assets/images/hama.png', withSubtitle: true, subtitle: '+2M Passionates', subtitleOnSameLevel: false, withIcon: false, withButton: true, buttonText: 'Visit', buttonAction: () => { console.log('Button clicked'); } }
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
