import { Component, input } from '@angular/core';
import { ItemPanelInfo } from '../../model/item-panel.type';
import {NgIf, NgClass } from '@angular/common';

@Component({
  selector: 'app-item-panel',
  imports: [NgIf],
  templateUrl: './item-panel.html',
  styleUrl: './item-panel.css'
})
export class ItemPanel {
  info = input<ItemPanelInfo>();
}