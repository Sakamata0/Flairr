// journeys-selector.ts - FIXED VERSION with real data loading
import { Component, Input, OnInit, OnChanges, Output, EventEmitter, signal, computed, SimpleChanges } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { supabase } from '../../../../core/supabase/supabase.client';
import { AuthService } from '../../../../core/auth/auth.service';
import { FlurrsService } from '../../../../core/services/flurrs.service';

interface Journey {
  journey_id: string;
  journey_name: string;
  date_creation: string;
}

@Component({
  selector: 'app-journeys-selector',
  imports: [NgFor, NgIf],
  templateUrl: './journeys-selector.html',
  styleUrl: './journeys-selector.css'
})
export class JourneysSelector implements OnInit, OnChanges {
  constructor(private auth: AuthService, private flurrsService: FlurrsService){}
  @Input() journeyInput: any[] = [];

  journeyData = signal<Journey[]>([]);
  journeys = computed(() => this.journeyData().map(j => j.journey_name));
  
  selectedYear = signal<string | null>(null);
  filteredJourneys = computed(() => {
    const year = this.selectedYear();
    if (!year) return this.journeyData();
    
    return this.journeyData().filter(j => {
      const journeyYear = new Date(j.date_creation).getFullYear().toString();
      return journeyYear === year;
    });
  });
  
  lastJourneys = computed(() => 
    this.filteredJourneys()
      .map(j => j.journey_name)
      .slice(0, 5)
  );
  
  expandedList: boolean = false;
  selectedJourney: number = 0;

  years = signal<string[]>([]);
  
  @Output() journeySelected = new EventEmitter<{journey_id: string; journey_name: string}>();

  ngOnInit() {
    this.processJourneys();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['journeyInput'] && !changes['journeyInput'].firstChange) {
      this.processJourneys();
    }
  }

  private processJourneys() {
    if (!this.journeyInput || this.journeyInput.length === 0) {
      this.journeyData.set([]);
      this.years.set([]);
      return;
    }

    // Store full journey data
    this.journeyData.set(this.journeyInput);

    // Extract unique years
    const yearsSet = new Set<string>();
    this.journeyInput.forEach((j: Journey) => {
      const year = new Date(j.date_creation).getFullYear();
      yearsSet.add(year.toString());
    });

    // Sort years descending
    const sortedYears = Array.from(yearsSet).sort((a, b) => 
      parseInt(b) - parseInt(a)
    );
    
    this.years.set(sortedYears);
    // Auto-select the first (most recent) year
    if (sortedYears.length > 0) {
      this.selectedYear.set(sortedYears[0]);
    }
  }

  selectJourney(i: number) {
    const filteredJourneys = this.filteredJourneys();
    if (i < filteredJourneys.length) {
      const selectedJourneyData = filteredJourneys[i];
      this.selectedJourney = i;
      
      // Emit the selected journey
      this.journeySelected.emit({
        journey_id: selectedJourneyData.journey_id,
        journey_name: selectedJourneyData.journey_name
      });
    }
  }

  onYearSelected(event: Event) {
    const target = event.target as HTMLSelectElement;
    const selectedYear = target.value;
    this.selectedYear.set(selectedYear);
    this.selectedJourney = 0; // Reset journey selection when year changes
  }

  toggleExpandList() {
    this.expandedList = !this.expandedList;
  }
}