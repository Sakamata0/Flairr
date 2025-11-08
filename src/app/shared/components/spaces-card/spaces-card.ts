import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemPanelInfo } from '../../model/item-panel.type';
import { ItemPanel } from '../item-panel/item-panel';
import { SpaceCreationCardDialog } from '../space-creation-card/space-creation-card';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-spaces-card',
  standalone: true,
  imports: [CommonModule,ItemPanel],
  templateUrl: './spaces-card.html',
  styleUrls: ['./spaces-card.css']
})
export class SpacesCard {
  // --- Injected Dependencies ---
  private readonly dialog = inject(MatDialog);
  
  // --- UI state variables ---
  spacesTypes = [
    { key: 0, name: 'Your Feed', iconUrl: './assets/icons/spaces-card/feed.png', activeIconUrl: './assets/icons/spaces-card/feed-active.png' },
    { key: 1, name: 'Discover', iconUrl: './assets/icons/spaces-card/explore.png', activeIconUrl: './assets/icons/spaces-card/explore-active.png' },
    { key: 2, name: 'My Spaces', iconUrl: './assets/icons/spaces-card/spaces.png', activeIconUrl: './assets/icons/spaces-card/spaces-active.png' },
  ];
  activeSpaceTypeKey = 0; // Default to 'Your Feed'
  title = input("Spaces you've Joined");
  noItemsMessage = input("No Spaces joined.");
  items = input<Array<ItemPanelInfo>>([
    {id: '1', title: 'Angular Space', imageUrl: './assets/images/hama.png', withSubtitle: true, subtitle: '1.7M Passionates', subtitleOnSameLevel: false, withIcon: false, withButton: true, buttonText: 'visit', buttonAction: () => { console.log('Button clicked'); } },
    {id: '2', title: 'Graphic Designers Space', imageUrl: '/assets/images/hama.png', withSubtitle: true, subtitle: '47k Passionates', subtitleOnSameLevel: false, withIcon: false, withButton: true, buttonText: 'visit', buttonAction: () => { console.log('Button clicked'); }},
    {id: '3', title: 'Sculptures Space', imageUrl: '/assets/images/skander.png', withSubtitle: true, subtitle: '8.2k Passionates', subtitleOnSameLevel: false, withIcon: false, withButton: true, buttonText: 'visit', buttonAction: () => { console.log('Button clicked'); } }
  ]);
  
  // --- Methods ---
  setActiveSpaceType(key: number) {
    this.activeSpaceTypeKey = key;
  }
  
  openSpaceCreationDialog(): void {
    this.dialog.open(SpaceCreationCardDialog, {
      panelClass: 'custom-journey-creation-dialog',
    }); 
  }
}
