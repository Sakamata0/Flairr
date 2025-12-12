// layouts/default-layout/default-layout.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FlurrHeaderComponent } from '../../shared/components/flurr-header/flurr-header';

@Component({
  selector: 'app-default-layout',
  imports: [RouterOutlet,FlurrHeaderComponent],
  templateUrl: './default-layout.html',
  styleUrl: './default-layout.css'
})
export class DefaultLayout {

}
