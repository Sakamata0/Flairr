import { Component, signal, OnInit } from '@angular/core';
import { JourneysService } from '../../../../core/services/journeys.service';
import { CommonModule, NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-journeys-selector',
  imports: [NgIf, NgFor, CommonModule],
  templateUrl: './journeys-selector.html',
  styleUrl: './journeys-selector.css',
  standalone: true
})
export class JourneysSelector implements OnInit {
  // mock data
  /*journeys = input<string[]>([
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
  ]);*/

  years = signal<string[]>([]);

  journeys = signal<string[]>([]);
  lastJourneys = signal<string[]>([]);
  expandedList = false;
  selectedJourney = 0;

  constructor(private journeysService: JourneysService) {}

  async ngOnInit() {
    const journeyList = await this.journeysService.getCurrentUserJourneys();

    // Map the names
    const names = journeyList.map(j => j.journey_name);

    // Map the years
    const yearsList = journeyList.map(j => {
      const date = new Date(j.date_creation); // convert string → Date
      return date.getFullYear().toString();    // get year as string
    });

    // Remove duplicates if you want unique years
    const uniqueYears = Array.from(new Set(yearsList));

    this.journeys.set(names);
    this.years.set(uniqueYears);
    this.lastJourneys.set(names.slice(0, 5));
    
  }

  selectJourney(i: number) {
    this.selectedJourney = i;
  }
}
