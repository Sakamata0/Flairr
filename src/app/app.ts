import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CardPanel } from './shared/components/card-panel/card-panel';
import { FlurrHeaderComponent } from './shared/components/flurr-header/flurr-header';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    CardPanel,
    FlurrHeaderComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Flairr');
     
}
