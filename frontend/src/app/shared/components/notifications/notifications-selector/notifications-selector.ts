import { NgClass } from '@angular/common';
import { Component, output } from '@angular/core';

@Component({
  selector: 'app-notifications-selector',
  imports: [],
  templateUrl: './notifications-selector.html',
  styleUrl: './notifications-selector.css'
})
export class NotificationsSelector {
  modeSignal = output<string>();
  mode: string = "all";

  changeMode(mode: string) {
    if(this.mode === mode) return
    this.modeSignal.emit(mode);
    this.mode = mode;
  }
}
