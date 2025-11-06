import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FlurrHeaderComponent } from './shared/components/flurr-header/flurr-header';
import { ProfileHeader } from "./shared/components/profile/profile-header/profile-header";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
<<<<<<< HEAD
    ProfileHeader,
    FlurrHeaderComponent,
    ProfileHeader
],
=======
    FlurrHeaderComponent
  ],
>>>>>>> 6f518086c1a69e9e0b02f833feb0e6ad389abfbd
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Flairr');
}
