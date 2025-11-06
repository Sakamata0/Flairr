import { Component, input } from '@angular/core';
import { ItemPanelInfo } from '../../model/item-panel.type';
import { NgFor, NgIf } from '@angular/common';
import { ItemPanel } from '../item-panel/item-panel';

@Component({
  selector: 'app-card-panel',
  imports: [NgIf, NgFor, ItemPanel],
  templateUrl: './card-panel.html',
  styleUrl: './card-panel.css'
})
export class CardPanel {
  title = input("Title");
  noItemsMessage = input("No Items to show.");
  items = input<Array<ItemPanelInfo>>([
    {id: '1', title: 'Mohamed Houcine', imageUrl: './assets/images/hama.png', withSubtitle: true, subtitle: 'liked your Flurr!', subtitleOnSameLevel: true, withIcon: true, iconUrl: 'assets/icons/panel/like.png', withButton: false},
    {id: '2', title: 'Mohamed Houcine', imageUrl: '/assets/images/hama.png', withSubtitle: true, subtitle: 'commented on your Flurr!', subtitleOnSameLevel: true, withIcon: true, iconUrl: 'assets/icons/panel/comment.png', withButton: false},
    {id: '3', title: 'Skander Boughnimi', imageUrl: '/assets/images/skander.png', withSubtitle: true, subtitle: '4.7k Followers', subtitleOnSameLevel: false, withIcon: false, withButton: true, buttonText: 'Follow', buttonAction: () => { console.log('Button clicked'); } }
  ]);
}