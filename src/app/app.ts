import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FlurrHeaderComponent } from './shared/components/flurr-header/flurr-header';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    FlurrHeaderComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Flairr');
}
