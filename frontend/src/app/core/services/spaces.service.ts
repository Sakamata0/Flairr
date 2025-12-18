import { Injectable } from '@angular/core';
import { getSupabase } from '../supabase/supabase.client';

@Injectable({ providedIn: 'root' })
export class SpacesService {
  private supabase: any = getSupabase();

  async insertSpace(spaceName: string, spaceBio: string) {
    // get logged-in user
    const { data: { user }, error: userError } = await this.supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error("No user logged in");

    // insert new space
    const { data, error } = await this.supabase
      .from('spaces')
      .insert([{
        space_name: spaceName,
        space_bio: spaceBio,
        space_owner: user.id
      }])
      .select('space_id')
      .single();

    if (error) throw error;
    return data.space_id;
  }

  async getUserSpaces(userId: string) {
    const { data, error } = await this.supabase
      .from('spaces')
      .select('*')
      .eq('space_owner', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data ?? [];
  }
}
