import { Injectable } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FlurrsService {
    private supabase = createClient(
        environment.supabaseUrl,
        environment.supabaseAnonKey
    );

    /*async getCurrentUserFlurrs() {
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
    }*/

    async insertFlurr(type: string, content: string, journeyID?: string, spaceID?: string) {
        // get the logged in user
        const { data: { user }, error: userError } = await this.supabase.auth.getUser();

        if (userError) throw userError;
        if (!user) return;

        const { data, error } = await this.supabase
            .from('flurrs')
            .insert([{
                type: type,
                content: content,
                journey_id: type === "flurr" ? journeyID : null,
                space_id: type === "space" ? spaceID : null,
                poster_id: user.id
        }]);

        if (error) throw error;

        return data;
    }

}
