import { Component } from '@angular/core';
import { FlurrCreationCard } from '../../shared/components/flurr-creation-card/flurr-creation-card';
import { CardPanel } from '../../shared/components/card-panel/card-panel';
import { ProfileHeader } from "../../shared/components/profile/profile-header/profile-header";

@Component({
  selector: 'app-home',
  imports: [
    FlurrCreationCard,
    CardPanel,
    ProfileHeader
],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {

}
