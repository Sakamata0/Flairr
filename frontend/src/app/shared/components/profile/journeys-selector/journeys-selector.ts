// journeys-selector.ts - FIXED VERSION with real data loading
import { Component, Input, OnInit, signal, computed } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { supabase } from '../../../../core/supabase/supabase.client';

@Component({
  selector: 'app-journeys-selector',
  imports: [NgFor, NgIf],
  templateUrl: './journeys-selector.html',
  styleUrl: './journeys-selector.css'
})
export class JourneysSelector implements OnInit {
  @Input() userId: string | null = null;

  journeys = signal<string[]>([]);
  
  lastJourneys = computed(() => this.journeys().slice(0, 5));
  
  expandedList: boolean = false;
  selectedJourney: number = 0;

  years = signal<string[]>([]);

  ngOnInit() {
    this.loadJourneys();
  }

  async loadJourneys() {
    if (!this.userId) {
      console.warn('No userId provided for journeys');
      return;
    }

    try {
      // Load journeys from database
      const { data, error } = await supabase
        .from('journeys')
        .select('journey_id, journey_name, year, created_at')
        .eq('user_id', this.userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading journeys:', error);
        return;
      }

      if (data && data.length > 0) {
        // Set journey names
  this.journeys.set(data.map((j: any) => j.journey_name));

        // Extract unique years
        const yearsSet = new Set<string>();
        data.forEach((j: any) => {
          if (j.year) {
            yearsSet.add(j.year.toString());
          } else if (j.created_at) {
            const year = new Date(j.created_at).getFullYear();
            yearsSet.add(year.toString());
          }
        });

        // Sort years descending
        const sortedYears = Array.from(yearsSet).sort((a, b) => 
          parseInt(b) - parseInt(a)
        );
        
        this.years.set(sortedYears);

        console.log('Loaded journeys:', {
          count: data.length,
          years: sortedYears
        });
      } else {
        // No journeys found - set empty arrays
        this.journeys.set([]);
        this.years.set([]);
        console.log('No journeys found for user:', this.userId);
      }

    } catch (err) {
      console.error('Unexpected error loading journeys:', err);
    }
  }

  selectJourney(i: number) {
    this.selectedJourney = i;
    // TODO: Emit event or navigate to journey detail
    console.log('Selected journey:', this.journeys()[i]);
  }

  toggleExpandList() {
    this.expandedList = !this.expandedList;
  }
}