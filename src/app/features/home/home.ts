import { Component } from '@angular/core';
import { FlurrCreationCard } from '../../shared/components/flurr-creation-card/flurr-creation-card';
import { CardPanel } from '../../shared/components/card-panel/card-panel';
import { MiniProfileCard } from '../../shared/components/mini-profile-card/mini-profile-card';
import { Post } from '../../shared/components/post-components/post/post';

@Component({
  selector: 'app-home',
  imports: [
    FlurrCreationCard,
    CardPanel,
    MiniProfileCard,
    Post
  ],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
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
}
