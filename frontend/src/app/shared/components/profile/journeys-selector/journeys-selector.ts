import { Component, signal, OnInit, Output, EventEmitter } from '@angular/core';
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

  @Output() selectionChange = new EventEmitter<{
    journeyId: string | null;
    year: string | null;
  }>();

  years = signal<string[]>([]);
  journeys = signal<{ id: string; name: string }[]>([]);
  lastJourneys = signal<{ id: string; name: string }[]>([]);

  expandedList = false;
  selectedJourney: string | null = null;
  selectedYear: string | null = null;

  constructor(private journeysService: JourneysService) {}

  async ngOnInit() {
    const journeyList = await this.journeysService.getCurrentUserJourneys();

    const names = journeyList.map(j => ({
      id: j.journey_id,
      name: j.journey_name
    }));

    const yearsList = journeyList.map(j => {
      const date = new Date(j.date_creation);
      return date.getFullYear().toString();
    });

    const uniqueYears = Array.from(new Set(yearsList));

    this.journeys.set(names);
    this.lastJourneys.set(names.slice(0, 5));
    this.years.set(uniqueYears);

    // auto-select first journey
    if (names.length > 0) {
      this.selectedJourney = names[0].id;
      this.emitSelection();
    }
  }

  selectJourney(id: string) {
    this.selectedJourney = id;
    this.emitSelection();
  }

  selectYear(year: string) {
    this.selectedYear = year;
    this.emitSelection();
  }

  private emitSelection() {
    this.selectionChange.emit({
      journeyId: this.selectedJourney,
      year: this.selectedYear
    });
  }
}
