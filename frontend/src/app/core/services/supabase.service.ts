import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { getSupabase } from '../supabase/supabase.client';

@Injectable({
    providedIn: 'root'
})
export class SupabaseService {
    private _client: SupabaseClient | any = null;
    private platformId = inject(PLATFORM_ID);

    /**
     * Return a Supabase client. Delegates to getSupabase() factory which
     * will return a real client in browser and a safe stub during SSR.
     */
    get client(): SupabaseClient | any {
        if (!this._client) {
            this._client = getSupabase();
        }
        return this._client;
    }

    constructor() {
        // Don't initialize in constructor - let it be lazy-loaded
        // Only initialize if in browser
        if (isPlatformBrowser(this.platformId)) {
            // Optionally pre-initialize
            // this.client;
        }
    }

    // Helper method to check if user is authenticated
    async isAuthenticated(): Promise<boolean> {
        if (!isPlatformBrowser(this.platformId)) {
            return false;
        }
        
        try {
            const { data: { user }, error } = await this.client.auth.getUser();
            return !error && !!user;
        } catch {
            return false;
        }
    }
}