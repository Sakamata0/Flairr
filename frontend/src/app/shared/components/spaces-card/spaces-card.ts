import { Component, inject, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemPanelInfo } from '../../model/item-panel.type';
import { ItemPanel } from '../item-panel/item-panel';
import { SpaceCreationCardDialog } from '../space-creation-card/space-creation-card';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-spaces-card',
  standalone: true,
  imports: [CommonModule, ItemPanel],
  templateUrl: './spaces-card.html',
  styleUrls: ['./spaces-card.css']
})
export class SpacesCard {
  private readonly dialog = inject(MatDialog);

  spacesTypes = [
    { key: 0, name: 'Your Feed', iconUrl: './assets/icons/spaces-card/feed.png', activeIconUrl: './assets/icons/spaces-card/feed-active.png' },
    { key: 1, name: 'Discover', iconUrl: './assets/icons/spaces-card/explore.png', activeIconUrl: './assets/icons/spaces-card/explore-active.png' },
    { key: 2, name: 'My Spaces', iconUrl: './assets/icons/spaces-card/spaces.png', activeIconUrl: './assets/icons/spaces-card/spaces-active.png' },
  ];
  activeSpaceTypeKey = 0;

  @Input() title = "Spaces you've Joined";
  @Input() noItemsMessage = "No spaces joined.";
  @Input() items: Array<ItemPanelInfo> = [];

  @Output() tabChanged = new EventEmitter<'feed' | 'discover' | 'mySpaces'>();

  setActiveSpaceType(key: number) {
    this.activeSpaceTypeKey = key;
    if (key === 0) this.tabChanged.emit('feed');
    else if (key === 1) this.tabChanged.emit('discover');
    else this.tabChanged.emit('mySpaces');
  }

  openSpaceCreationDialog(): void {
    this.dialog.open(SpaceCreationCardDialog, { panelClass: 'custom-journey-creation-dialog' });
  }
}
