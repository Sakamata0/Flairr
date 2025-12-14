import { Component, ElementRef, inject, input } from '@angular/core';
import { CardPanel } from '../../shared/components/card-panel/card-panel';
import { Post } from '../../shared/components/post-components/post/post';
import { ProfileHeader } from '../../shared/components/profile/profile-header/profile-header';
import { NgIf } from '@angular/common';
import { SpaceInfo, SpaceVisibility } from '../../shared/model/space-info.type';
import { SpaceFlurrCreationCard } from '../../shared/components/space-flurr-creation-card/space-flurr-creation-card';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-flurr-space-profile',
  imports: [
    SpaceFlurrCreationCard,
    CardPanel,
    Post,
    ProfileHeader,
    NgIf
  ],
  templateUrl: './flurr-space-profile.html',
  styleUrl: './flurr-space-profile.css'
})
export class FlurrSpaceProfile {

  info = input<SpaceInfo>(
    {
      spacename: 'Angular space',
      profileImageUrl: 'assets/images/default-profile-picture',
      bannerImageUrl: 'assets/images/default-banner-image',
      bio: 'This space has no bio',
      about: 'This space has no About section',
      membersCount: 0,
      visibility: SpaceVisibility.PUBLIC
    }
  );
  
  public currentSpaceID;
  private route = inject(ActivatedRoute);
  constructor(
    private elementRef: ElementRef<HTMLElement>,
  ) {
    // Read the `id` param from the route
    const id = this.route.snapshot.paramMap.get('spaceId'); 
    this.currentSpaceID = id; // combine
  };

  invitations =  [
    {id: '1', title: 'Amine Dev', imageUrl: './assets/images/hama.png', withSubtitle: true, subtitle: '10.9K Followers', subtitleOnSameLevel: false, withIcon: false, withButton: true, buttonText: 'Invite', buttonAction: () => { console.log('user invited')} },
    {id: '1', title: 'Mohammed Houcine', imageUrl: './assets/images/hama.png', withSubtitle: true, subtitle: '10.9K Followers', subtitleOnSameLevel: false, withIcon: false, withButton: true, buttonText: 'Invite', buttonAction: () => { console.log('user invited')} },
    {id: '1', title: 'Touhami', imageUrl: './assets/images/hama.png', withSubtitle: true, subtitle: '10.9K Followers', subtitleOnSameLevel: false, withIcon: false, withButton: true, buttonText: 'Invite', buttonAction: () => { console.log('user invited')} },
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

  ngOnInit(){
    console.log("spaaaaaaaaaace", this.currentSpaceID)
  }
}
