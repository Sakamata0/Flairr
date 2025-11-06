import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SHARED_IMPORTS } from './shared/imports';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    /* from file named imports.ts in ./shared directory it is made to group all the reusable 
    components in the ./shared/components directory like FlurrCreationCard,FlurrHeaderComponent... */
    [...SHARED_IMPORTS],
    /* else : pages components would be here (suggestion !) */
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Flairr');
}
