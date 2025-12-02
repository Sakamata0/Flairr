import { Component, ElementRef, input } from '@angular/core';
import { MiniProfileCard } from "../../shared/components/mini-profile-card/mini-profile-card";
import { CardPanel } from "../../shared/components/card-panel/card-panel";
import { Router } from '@angular/router';
import { NotificationsSelector } from "../../shared/components/notifications/notifications-selector/notifications-selector";
import { NotificationsContainer } from "../../shared/components/notifications-container/notifications-container";

@Component({
  selector: 'app-notifications',
  imports: [MiniProfileCard, CardPanel, NotificationsSelector, NotificationsContainer],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css'
})

export class Notifications {

  constructor(private elementRef: ElementRef<HTMLElement>,private router: Router) {}

  selectedNotifications: string = "all";

  shortcuts = [
      {id: '1', title: 'Web Developers Space', imageUrl: './assets/images/hama.png', withSubtitle: true, subtitle: '+1.5M Passionates', subtitleOnSameLevel: false, withIcon: false, withButton: true, buttonText: 'Visit', buttonAction: () => { this.router.navigate(['/profile-name']);} },
      {id: '2', title: 'Angular Space', imageUrl: './assets/images/hama.png', withSubtitle: true, subtitle: '+800k Passionates', subtitleOnSameLevel: false, withIcon: false, withButton: true, buttonText: 'Visit', buttonAction: () => { console.log('Button clicked'); } },
      {id: '3', title: 'Artists Space', imageUrl: './assets/images/hama.png', withSubtitle: true, subtitle: '+2M Passionates', subtitleOnSameLevel: false, withIcon: false, withButton: true, buttonText: 'Visit', buttonAction: () => { console.log('Button clicked'); } }
  ];

  onModeChange(mode: string) {
    this.selectedNotifications = mode;
  }
}
