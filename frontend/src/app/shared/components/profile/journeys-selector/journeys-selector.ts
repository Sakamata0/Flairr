import { Component, input, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-journeys-selector',
  imports: [NgFor, NgIf],
  templateUrl: './journeys-selector.html',
  styleUrl: './journeys-selector.css'
})
export class JourneysSelector {
  journeys = input<string[]>([
    'Blog App - Flairr.',
    'E-Commerce Store',
    'Weather App',
    'To-Do List App',
    'Personal Portfolio Website',
    'Blog App - Flairr.',
    'E-Commerce Store',
    'Weather App',
    'To-Do List App',
    'Personal Portfolio Website',
    'Blog App - Flairr.',
    'E-Commerce Store',
    'Weather App',
    'To-Do List App',
    'Personal Portfolio Website'
  ]);

  lastJourneys = signal(this.journeys().slice(0, 5));
  expandedList: boolean = false;
  selectedJourney: number = 0;

  years = input<string[]>([
    '2025',
    '2024',
    '2023'
  ]);

  selectJourney(i: number) {
    this.selectedJourney = i;
  }
}
