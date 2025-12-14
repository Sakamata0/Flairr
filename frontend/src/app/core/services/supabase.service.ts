import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class SupabaseService {
    private _client: SupabaseClient | null = null;
    private platformId = inject(PLATFORM_ID);

    get client(): SupabaseClient {
        if (!this._client) {
            // Only create client in browser environment
            if (!isPlatformBrowser(this.platformId)) {
                throw new Error('Supabase client can only be initialized in browser');
            }

            this._client = createClient(
                environment.supabaseUrl,
                environment.supabaseAnonKey,
                {
                    auth: {
                        autoRefreshToken: true,
                        persistSession: true,
                        detectSessionInUrl: true,
                        flowType: 'pkce',
                        // Use default storage with a unique key
                        storageKey: `sb-${environment.supabaseUrl.split('//')[1].split('.')[0]}-auth-token`
                    },
                    realtime: {
                        params: {
                            eventsPerSecond: 2
                        }
                    }
                }
            );

            // Log for debugging
            console.log('✅ Supabase client initialized');
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