import { Component } from '@angular/core';
import { FlurrCreationCard } from '../../shared/components/flurr-creation-card/flurr-creation-card';
import { CardPanel } from '../../shared/components/card-panel/card-panel';
import { FlurrHeaderComponent } from '../../shared/components/flurr-header/flurr-header';

@Component({
  selector: 'app-home',
  imports: [
    FlurrCreationCard,
    CardPanel
  ],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {

}
