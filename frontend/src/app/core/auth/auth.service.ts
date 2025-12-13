// src/app/core/auth/auth.service.ts
import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { supabase } from '../supabase/supabase.client';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { Router, RouteReuseStrategy } from '@angular/router';
import { CustomRouteReuseStrategy } from '../routing/custom-reuse.strategy';

export interface SignupData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  username: string;
  tel_number?: number;
  type: 'personal' | 'business';
  role: 'admin' | 'employee';
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  session = signal<Session | null>(null);
  user = signal<SupabaseUser | null>(null);

  constructor(
    @Inject(PLATFORM_ID) private platformId: any,
    private router: Router,
    private routeReuse: RouteReuseStrategy
  ) {
    if (this.isBrowser()) {
      this.init();
    }
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private async init() {
    const { data } = await supabase.auth.getSession();
    this.session.set(data.session ?? null);
    this.user.set(data.session?.user ?? null);

    supabase.auth.onAuthStateChange((_event, session) => {
      this.session.set(session ?? null);
      this.user.set(session?.user ?? null);
    });
  }

  /**
   * Signup avec création automatique du profil utilisateur
   */
  async signupWithProfile(signupData: SignupData) {
    if (!this.isBrowser()) {
      return { data: null, error: { message: 'not-browser' } };
    }

    try {
      console.log('🔵 Starting signup process...');

      // ÉTAPE 1: Vérifier si l'email existe déjà
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', signupData.email)
        .single();

      if (existingUser) {
        throw new Error('This email is already registered. Please login instead.');
      }

      // ÉTAPE 2: Créer l'utilisateur dans auth.users
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          data: {
            first_name: signupData.first_name,
            last_name: signupData.last_name,
            username: signupData.username,
            type: signupData.type,
            role: signupData.role
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (authError) {
        console.error('❌ Auth signup error:', authError);
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Failed to create user - no user returned');
      }

      console.log('✅ Auth user created:', authData.user.id);

      // ÉTAPE 3: Attendre que le trigger s'exécute (si configuré)
      await new Promise(resolve => setTimeout(resolve, 500));

      // ÉTAPE 4: Vérifier si le profil existe
      const { data: profileCheck, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('id', authData.user.id)
        .maybeSingle();

      // ÉTAPE 5: Créer le profil manuellement si nécessaire
      if (!profileCheck || checkError) {
        console.warn('⚠️ Profile not found, creating manually...');

        const profileData: any = {
          id: authData.user.id,
          email: signupData.email,
          first_name: signupData.first_name,
          last_name: signupData.last_name,
          username: signupData.username,
          type: signupData.type,
          role: signupData.role,
          language: 'en',
          theme: 'light'
        };

        if (signupData.tel_number) {
          profileData.tel_number = signupData.tel_number;
        }

        const { data: insertedProfile, error: profileError } = await supabase
          .from('users')
          .insert([profileData])
          .select()
          .single();

        if (profileError) {
          console.error('❌ Profile creation error:', {
            message: profileError.message,
            details: profileError.details,
            hint: profileError.hint,
            code: profileError.code
          });
          
          throw new Error(`Failed to create user profile: ${profileError.message}`);
        }

        console.log('✅ Profile created manually:', insertedProfile);
      } else {
        console.log('✅ Profile already exists (created by trigger)');
      }

      // ÉTAPE 6: Mettre à jour les signaux
      this.session.set(authData.session ?? null);
      this.user.set(authData.user);

      return { data: authData, error: null };

    } catch (error: any) {
      console.error('❌ Signup error:', error);
      return { 
        data: null, 
        error: { 
          message: error.message || 'Signup failed. Please try again.' 
        } 
      };
    }
  }

  /**
   * Signup simple (sans profil automatique)
   * @deprecated Utilisez signupWithProfile() à la place
   */
  async signup(email: string, password: string) {
    if (!this.isBrowser()) {
      return { error: { message: 'not-browser' } };
    }
    return await supabase.auth.signUp({ email, password });
  }

  async login(email: string, password: string) {
    if (!this.isBrowser()) {
      return { error: { message: 'not-browser' } };
    }
    return await supabase.auth.signInWithPassword({ email, password });
  }

  async logout() {
    if (!this.isBrowser()) return;
    await supabase.auth.signOut();
    this.session.set(null);
    this.user.set(null);
    const reuse = this.routeReuse as CustomRouteReuseStrategy;
    reuse.clearCache();
    this.router.navigate(['/signin']);
  }

  async isLoggedIn(): Promise<boolean> {
    if (!this.isBrowser()) return false;
    if (this.session()) return true;
    const { data } = await supabase.auth.getSession();
    this.session.set(data.session ?? null);
    this.user.set(data.session?.user ?? null);
    return !!data.session;
  }

  async checkAuth(): Promise<boolean> {
    if (!this.isBrowser()) return false;

    // If we already have a session, return true
    if (this.session()) return true;

    // Otherwise, fetch session from Supabase
    const { data } = await supabase.auth.getSession();
    this.session.set(data.session ?? null);
    this.user.set(data.session?.user ?? null);

    return !!data.session;
  }

  /**
   * Récupérer le profil complet de l'utilisateur
   */
  async getProfile() {
    const userId = this.getUserId();
    if (!userId) return null;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('getProfile error:', error);
      return null;
    }

    return data;
  }

  getUserId(): string | null {
    return this.user()?.id ?? null;
  }

  getAccessToken(): string | null {
    return this.session()?.access_token ?? null;
  }

  getUserEmail(): string | null {
    return this.user()?.email ?? null;
  }
}