import { Component, input, signal } from '@angular/core';
import { ItemPanelInfo } from '../../model/item-panel.type';
import { NgIf, NgClass } from '@angular/common';

@Component({
  selector: 'app-item-panel',
  imports: [NgIf, NgClass],
  templateUrl: './item-panel.html',
  styleUrl: './item-panel.css'
})
export class ItemPanel {
  info = input<ItemPanelInfo>();
  //change of state: when i click visit or follow (i will change lets say color, bg ...)
  buttonClicked = signal(false);
  
  toggleButton(): void {
    // get current info
    const currentInfo = this.info();
    if (currentInfo?.buttonAction) {
      if (currentInfo?.buttonText?.includes("Follow")) {
        // update the button text
        currentInfo.buttonText = this.buttonClicked() ? "Follow" : "Pending";
        // toggle clicked class
        this.buttonClicked.set(!this.buttonClicked());
      }

      if (currentInfo?.buttonText?.includes("Visit")) {
        currentInfo.buttonAction();
      }
    }
  }

}