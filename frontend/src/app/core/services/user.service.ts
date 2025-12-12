// src/app/core/user.service.ts
import { Injectable, signal } from '@angular/core';
import { User } from '../../shared/model/classes/user';
import { supabase } from '../supabase/supabase.client'; 

@Injectable({
  providedIn: 'root'
})
export class UserService {
  currentUser = signal<User | null>(null);

  constructor() {}

  private mapRowToUser(row: any): User {
    return {
      userID: row.user_id,
      fullName: row.full_name ?? '',
      email: row.email ?? '',
      bio: row.bio ?? '',
      avatarImg: row.avatar_img ?? '',
      coverImg: row.cover_img ?? '',

      followers: row.followers ?? [],
      following: row.following ?? [],
      journeys: row.journeys ?? [],
      flurrs: row.flurrs ?? [],

      spacesCreated: row.spaces_created ?? [],
      spacesJoined: row.spaces_joined ?? [],

      getUser: function (): User {
        throw new Error('Function not implemented.');
      },
      editProfile: function (user: User): void {
        throw new Error('Function not implemented.');
      }
    } as User;
  }

  // -------------------------------------------------------------
  // SAFE VERSION: Load base user, then load counts separately
  // -------------------------------------------------------------
  async loadUserById(userId: string) {
    try {
      // -------------------------
      // 1) BASE USER ROW
      // -------------------------
      const { data: userRow, error: userErr } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (userErr || !userRow) {
        console.error('UserService.loadUserById error', userErr);
        this.currentUser.set(null);
        return { data: null, error: userErr };
      }

      // -------------------------
      // 2) FOLLOWERS
      // -------------------------
      const { data: followers } = await supabase
        .from('friends')
        .select('follower_id')
        .eq('followed_id', userId);

      // -------------------------
      // 3) FOLLOWING
      // -------------------------
      const { data: following } = await supabase
        .from('friends')
        .select('followed_id')
        .eq('follower_id', userId);

      // -------------------------
      // 4) FLURRS / JOURNEYS (your UI uses journeys count)
      // -------------------------
      const { data: journeys } = await supabase
        .from('journeys')
        .select('journey_id')
        .eq('user_id', userId);

    // 4) FLURR COUNT — REAL POSTS
      const { data: flurrs } = await supabase
      .from('flurrs')
      .select('flurr_id')
      .eq('poster_id', userId);





    
      const user = this.mapRowToUser({
        ...userRow,
        followers: followers ?? [],
        following: following ?? [],
        journeys: journeys ?? [],
        flurrs: flurrs ?? []
        
      });

      console.log("testinit",user.flurrs.length)

      this.currentUser.set(user);
      console.log('testinit',this.currentUser)
      
      return { data: user, error: null };


    } catch (err) {
      console.error('UserService.loadUserById unexpected', err);
      return { data: null, error: err as any };
    }


    
  }

  async loadFromAuthUserId(authUserId: string | null | undefined) {
    if (!authUserId) {
      this.clearUser();
      return { data: null, error: null };
    }
    return await this.loadUserById(authUserId);
  }

  async createProfile(profile: {
    user_id: string;
    full_name?: string;
    email?: string;
    bio?: string;
    avatar_img?: string;
    cover_img?: string;
  }) {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([profile])
        .select()
        .single();

      if (error) {
        console.error('UserService.createProfile error', error);
        return { data: null, error };
      }

      const user = this.mapRowToUser(data);
      this.currentUser.set(user);
      return { data: user, error: null };

    } catch (err) {
      console.error('UserService.createProfile unexpected', err);
      return { data: null, error: err as any };
    }
  }

  async updateProfile(userId: string, updates: {
    full_name?: string;
    bio?: string;
    avatar_img?: string;
    cover_img?: string;
  }) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('UserService.updateProfile error', error);
        return { data: null, error };
      }

      const user = this.mapRowToUser(data);
      this.currentUser.set(user);
      return { data: user, error: null };

    } catch (err) {
      console.error('UserService.updateProfile unexpected', err);
      return { data: null, error: err as any };
    }
  }

  setUser(user: User) {
    this.currentUser.set(user);
  }

  clearUser() {
    this.currentUser.set(null);
  }
}
