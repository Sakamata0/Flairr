// src/app/core/services/user.service.ts - FIXED VERSION
import { Injectable, signal } from '@angular/core';
import { User } from '../../shared/model/classes/user';
import { getSupabase } from '../supabase/supabase.client';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  currentUser = signal<User | null>(null);

  constructor() {
    console.log('UserService initialized');
  }

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

  async loadUserById(userId: string) {
    console.log('UserService - Loading user by ID:', userId);
    
    try {
      // -------------------------
      // 1) BASE USER ROW
      // -------------------------
      const supabase = getSupabase();
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

      console.log('UserService - Base user row loaded:', userRow);

      // -------------------------
      // 2) FOLLOWERS (people who follow this user)
      // -------------------------
      const { data: followers, error: followersErr } = await supabase
        .from('friends')
        .select('follower_id')
        .eq('followed_id', userId);

      if (followersErr) {
        console.warn('UserService - Followers error:', followersErr);
      }

      console.log('UserService - Followers loaded:', followers?.length || 0);

      // -------------------------
      // 3) FOLLOWING (people this user follows)
      // -------------------------
      const { data: following, error: followingErr } = await supabase
        .from('friends')
        .select('followed_id')
        .eq('follower_id', userId);

      if (followingErr) {
        console.warn('UserService - Following error:', followingErr);
      }

      console.log('UserService - Following loaded:', following?.length || 0);

      // -------------------------
      // 4) JOURNEYS
      // -------------------------
      const { data: journeys, error: journeysErr } = await supabase
        .from('journeys')
        .select('journey_id')
        .eq('user_id', userId);

      if (journeysErr) {
        console.warn('UserService - Journeys error:', journeysErr);
      }

      console.log('UserService - Journeys loaded:', journeys?.length || 0);

      // -------------------------
      // 5) FLURRS (actual posts by this user)
      // -------------------------
      const { data: flurrs, error: flurrsErr } = await supabase
        .from('flurrs')
        .select('flurr_id')
        .eq('poster_id', userId)
        .is('space_id', null);

      if (flurrsErr) {
        console.warn('UserService - Flurrs error:', flurrsErr);
      }

      console.log('UserService - Flurrs loaded:', flurrs?.length || 0);

      // -------------------------
      // 6) MAP TO USER OBJECT
      // -------------------------
      const user = this.mapRowToUser({
        ...userRow,
        followers: followers ?? [],
        following: following ?? [],
        journeys: journeys ?? [],
        flurrs: flurrs ?? []
      });

      console.log('UserService - Final user object:', {
        userID: user.userID,
        fullName: user.fullName,
        flurrsCount: user.flurrs.length,
        followersCount: user.followers.length,
        followingCount: user.following.length
      });

      // ⭐ IMPORTANT: Set the signal
      this.currentUser.set(user);
      
      console.log('UserService - currentUser signal updated');

      return { data: user, error: null };

    } catch (err) {
      console.error('UserService.loadUserById unexpected error:', err);
      this.currentUser.set(null);
      return { data: null, error: err as any };
    }
  }

  async loadFromAuthUserId(authUserId: string | null | undefined) {
    console.log('UserService - loadFromAuthUserId called with:', authUserId);
    
    if (!authUserId) {
      console.log('UserService - No auth user ID, clearing user');
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
    console.log('UserService - Creating profile:', profile);
    
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('users')
        .insert([profile])
        .select()
        .single();

      if (error) {
        console.error('UserService.createProfile error', error);
        return { data: null, error };
      }

      const user = this.mapRowToUser({
        ...data,
        followers: [],
        following: [],
        journeys: [],
        flurrs: []
      });
      
      this.currentUser.set(user);
      
      console.log('UserService - Profile created:', user);
      
      return { data: user, error: null };

    } catch (err) {
      console.error('UserService.createProfile unexpected error:', err);
      return { data: null, error: err as any };
    }
  }

  async updateProfile(userId: string, updates: {
    full_name?: string;
    bio?: string;
    avatar_img?: string;
    cover_img?: string;
  }) {
    console.log('UserService - Updating profile:', userId, updates);
    
    try {
      const supabase = getSupabase();
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

      // Reload the complete user data with all counts
      await this.loadUserById(userId);
      
      console.log('UserService - Profile updated and reloaded');

      return { data: this.currentUser(), error: null };

    } catch (err) {
      console.error('UserService.updateProfile unexpected error:', err);
      return { data: null, error: err as any };
    }
  }

  setUser(user: User) {
    console.log('UserService - setUser called:', user);
    this.currentUser.set(user);
  }

  clearUser() {
    console.log('UserService - clearUser called');
    this.currentUser.set(null);
  }
}