import { Injectable } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class JourneysService {
    private supabase = createClient(
        environment.supabaseUrl,
        environment.supabaseAnonKey
    );

    async getCurrentUserJourneys() {
        // get the logged in user
        const { data: { user }, error: userError } =
        await this.supabase.auth.getUser();

        if (userError) throw userError;
        if (!user) return [];

        // query journeys belonging to this user
        const { data, error } = await this.supabase
        .from('journeys')
        .select('journey_id, journey_name, date_creation')
        .eq('user_id', user.id)
        .order('date_creation', { ascending: false });

        if (error) throw error;

        return data;
    }

    async insertJourney(name: string): Promise<string> {
        // get the logged-in user
        const { data: { user }, error: userError } = await this.supabase.auth.getUser();

        if (userError) throw userError;
        if (!user) throw new Error("No user logged in");

        // insert the journey and return the id
        const { data, error } = await this.supabase
            .from('journeys')
            .insert([{
                journey_name: name,
                user_id: user.id
            }])
            .select('journey_id') // <- this ensures the id is returned
            .single();    // <- returns a single object instead of an array

        if (error) throw error;

        return data.journey_id; // return the newly created journey's id
    }


}
