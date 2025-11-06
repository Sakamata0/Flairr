import { Component } from '@angular/core';
import { FlurrCreationCard } from '../../shared/components/flurr-creation-card/flurr-creation-card';
import { CardPanel } from '../../shared/components/card-panel/card-panel';
import { ProfileHeader } from "../../shared/components/profile/profile-header/profile-header";
import { MiniProfileCard } from '../../shared/components/mini-profile-card/mini-profile-card';

@Component({
  selector: 'app-home',
  imports: [
    FlurrCreationCard,
    CardPanel,
    ProfileHeader,
    MiniProfileCard
  ],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {

}
