import { Component } from '@angular/core';
import { FlurrCreationCard } from '../../shared/components/flurr-creation-card/flurr-creation-card';
import { CardPanel } from '../../shared/components/card-panel/card-panel';
import { MiniProfileCard } from '../../shared/components/mini-profile-card/mini-profile-card';

@Component({
  selector: 'app-home',
  imports: [
    FlurrCreationCard,
    CardPanel,
    MiniProfileCard
  ],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {

}
