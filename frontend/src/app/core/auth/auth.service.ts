// src/app/core/auth/auth.service.ts
import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { supabase } from '../supabase/supabase.client';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  session = signal<Session | null>(null);
  user = signal<SupabaseUser | null>(null);

  constructor(@Inject(PLATFORM_ID) private platformId: any, private router: Router) {
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

  async signup(email: string, password: string) {
    if (!this.isBrowser()) return { error: { message: 'not-browser' } };
    return await supabase.auth.signUp({ email, password });
  }

  async login(email: string, password: string) {
    if (!this.isBrowser()) return { error: { message: 'not-browser' } };
    return await supabase.auth.signInWithPassword({ email, password });
  }

  async logout() {
    if (!this.isBrowser()) return;
    await supabase.auth.signOut();
    this.session.set(null);
    this.user.set(null);
    this.router.navigate(['/login']);
  }

  async isLoggedIn(): Promise<boolean> {
    if (!this.isBrowser()) return false;
    if (this.session()) return true;
    const { data } = await supabase.auth.getSession();
    this.session.set(data.session ?? null);
    this.user.set(data.session?.user ?? null);
    return !!data.session;
  }

  getUserId(): string | null { return this.user()?.id ?? null; }
  getAccessToken(): string | null { return this.session()?.access_token ?? null; }
}


