import { Injectable } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FlurrsService {
    private supabase = createClient(
        environment.supabaseUrl,
        environment.supabaseAnonKey
    );

    async getUserFlurrs(
        posterId: string,
        journeyId?: string | null,
        year?: string | null
        ) {
        let query = this.supabase
            .from('flurrs')
            .select('*')
            .eq('poster_id', posterId)
            .order('created_at', { ascending: false });

        if (journeyId) {
            query = query.eq('journey_id', journeyId);
        }

        if (year) {
            const start = `${year}-01-01`;
            const end = `${year}-12-31`;
            query = query.gte('created_at', start).lte('created_at', end);
        }

        const { data, error } = await query;

        if (error) throw error;

        return data ?? [];
    }

    async getFlurrsNumber(userID: string, type: string): Promise<number> {
        const { count, error } = await this.supabase
            .from('flurrs')
            .select('*', { count: 'exact', head: true })
            .eq('poster_id', userID)
            .eq('type', type);

        if (error) throw error;

        return count ?? 0;
    }



    async uploadFlurrFile(flurrId: string, file: File) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `${flurrId}/${fileName}`;

        const { error: uploadError } = await this.supabase.storage
            .from('flurr-files')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = this.supabase.storage
            .from('flurr-files')
            .getPublicUrl(filePath);

        const mediaType = file.type.startsWith('image')
            ? 'image'
            : file.type.startsWith('video')
            ? 'video'
            : 'unknown';

        return {
            url: data.publicUrl,
            type: mediaType
        };
    }

    async insertFlurrFileRecord(
        flurrId: string,
        linkUrl: string,
        type?: string
        ) {
        const { error } = await this.supabase
            .from('flurr_files')
            .insert({
            flurr_id: flurrId,
            link_url: linkUrl,
            type
            });

        if (error) throw error;
    }



    async insertFlurr(type: string, content: string, journeyID?: string, spaceID?: string) {
        // get the logged in user
        const { data: { user }, error: userError } = await this.supabase.auth.getUser();

        if (userError) throw userError;
        if (!user) return;

        const { data, error } = await this.supabase
        .from('flurrs')
        .insert([{
            type,
            content,
            journey_id: type === 'flurr' ? journeyID : null,
            space_id: type === 'space' ? spaceID : null,
            poster_id: user.id
        }])
        .select()
        .single();


        if (error) throw error;

        return data;
    }

}
