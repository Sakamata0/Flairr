import { Injectable, signal } from "@angular/core";
import { FriendsProfile } from '../../shared/model/friends-profile.type';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from '../../core/services/supabase.service';

@Injectable({ providedIn: 'root' })
export class FriendsService {

  private supabase: SupabaseClient;

  constructor(private supabaseService: SupabaseService) {
    this.supabase = this.supabaseService.client;
  }

  // STATE (Angular Signals)
  private friendRequestsSig = signal<FriendsProfile[]>([]);
  private followersSig = signal<FriendsProfile[]>([]);
  private followingSig = signal<FriendsProfile[]>([]);
  private suggestionsSig = signal<FriendsProfile[]>([]);

  private loadingSig = signal<boolean>(false);
  private errorSig = signal<string | null>(null);

  friendRequests = this.friendRequestsSig.asReadonly();
  followers = this.followersSig.asReadonly();
  following = this.followingSig.asReadonly();
  suggestions = this.suggestionsSig.asReadonly();
  loading = this.loadingSig.asReadonly();
  error = this.errorSig.asReadonly();

  // SUGGESTIONS
  async loadSuggestions(me: string): Promise<void> {
    try {
      this.loadingSig.set(true);
      this.errorSig.set(null);

      const excludedIds = await this.getExcludedUserIds(me);

      let query = this.supabase
        .from('users')
        .select('user_id, full_name, avatar_img, cover_img');

      if (excludedIds.length > 0) {
        query = query.not('user_id', 'in', `(${excludedIds.join(',')})`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading suggestions:', error);
        this.errorSig.set(error.message);
        throw error;
      }

      this.suggestionsSig.set(
        (data ?? []).map(u => ({
          id: u.user_id,
          name: u.full_name,
          avatar: u.avatar_img,
          banner: u.cover_img,
          mutuals: 0
        }))
      );
    } catch (error) {
      console.error('Failed to load suggestions:', error);
      this.errorSig.set('Failed to load suggestions');
    } finally {
      this.loadingSig.set(false);
    }
  }

  private async getExcludedUserIds(me: string): Promise<string[]> {
    try {
      const { data, error } = await this.supabase
        .from('request_follow')
        .select('requester_id, requested_id, status')
        .or(
          `and(requester_id.eq.${me},status.in.(pending,accepted)),and(requested_id.eq.${me},status.in.(pending,accepted))`
        );

      if (error) {
        console.error('Error getting excluded user IDs:', error);
        return [me];
      }

      const excluded = new Set<string>();
      excluded.add(me);

      (data ?? []).forEach(row => {
        excluded.add(row.requester_id);
        excluded.add(row.requested_id);
      });

      return Array.from(excluded);
    } catch (error) {
      console.error('Failed to get excluded user IDs:', error);
      return [me];
    }
  }

  // FOLLOW REQUESTS
  async sendFollowRequest(targetUserId: string, me: string): Promise<void> {
    try {
      this.errorSig.set(null);

      const { error } = await this.supabase
        .from('request_follow')
        .upsert(
          {
            requester_id: me,
            requested_id: targetUserId,
            status: 'pending',
            responded_at: null
          },
          { onConflict: 'requester_id,requested_id' }
        );

      if (error) {
        console.error('Error sending follow request:', error);
        this.errorSig.set(error.message);
        throw error;
      }

      this.suggestionsSig.update(list =>
        list.filter(u => u.id !== targetUserId)
      );
    } catch (error) {
      console.error('Failed to send follow request:', error);
      this.errorSig.set('Failed to send follow request');
      throw error;
    }
  }

  async loadFriendRequests(me: string): Promise<void> {
    try {
      this.loadingSig.set(true);
      this.errorSig.set(null);

      // FIXED: Use the correct FK name 'fk_request_follow_requester' or 'requester_id'
      const { data, error } = await this.supabase
        .from('request_follow')
        .select(`
          requester_id,
          requester:users!fk_request_follow_requester (
            user_id,
            full_name,
            avatar_img,
            cover_img
          )
        `)
        .eq('requested_id', me)
        .eq('status', 'pending');

      if (error) {
        console.error('Error loading friend requests:', error);
        this.errorSig.set(error.message);
        throw error;
      }

      this.friendRequestsSig.set(
        (data ?? [])
          .filter((row: any) => row.requester)
          .map((row: any) => ({
            id: row.requester.user_id,
            name: row.requester.full_name,
            avatar: row.requester.avatar_img,
            banner: row.requester.cover_img,
            mutuals: 0
          }))
      );
    } catch (error) {
      console.error('Failed to load friend requests:', error);
      this.errorSig.set('Failed to load friend requests');
    } finally {
      this.loadingSig.set(false);
    }
  }

  async acceptFollowRequest(requesterId: string, me: string): Promise<void> {
    try {
      this.errorSig.set(null);

      const { error } = await this.supabase
        .from('request_follow')
        .update({
          status: 'accepted',
          responded_at: new Date().toISOString()
        })
        .eq('requester_id', requesterId)
        .eq('requested_id', me);

      if (error) {
        console.error('Error accepting follow request:', error);
        this.errorSig.set(error.message);
        throw error;
      }

      this.friendRequestsSig.update(list =>
        list.filter(u => u.id !== requesterId)
      );
    } catch (error) {
      console.error('Failed to accept follow request:', error);
      this.errorSig.set('Failed to accept follow request');
      throw error;
    }
  }

  async rejectFollowRequest(requesterId: string, me: string): Promise<void> {
    try {
      this.errorSig.set(null);

      const { error } = await this.supabase
        .from('request_follow')
        .update({
          status: 'rejected',
          responded_at: new Date().toISOString()
        })
        .eq('requester_id', requesterId)
        .eq('requested_id', me);

      if (error) {
        console.error('Error rejecting follow request:', error);
        this.errorSig.set(error.message);
        throw error;
      }

      this.friendRequestsSig.update(list =>
        list.filter(u => u.id !== requesterId)
      );
    } catch (error) {
      console.error('Failed to reject follow request:', error);
      this.errorSig.set('Failed to reject follow request');
      throw error;
    }
  }

  // FOLLOWERS / FOLLOWING
  async loadFollowers(me: string): Promise<void> {
    try {
      this.loadingSig.set(true);
      this.errorSig.set(null);

      // FIXED: Use the correct FK name
      const { data, error } = await this.supabase
        .from('request_follow')
        .select(`
          requester_id,
          requester:users!fk_request_follow_requester (
            user_id,
            full_name,
            avatar_img,
            cover_img
          )
        `)
        .eq('requested_id', me)
        .eq('status', 'accepted');

      if (error) {
        console.error('Error loading followers:', error);
        this.errorSig.set(error.message);
        throw error;
      }

      this.followersSig.set(
        (data ?? [])
          .filter((row: any) => row.requester)
          .map((row: any) => ({
            id: row.requester.user_id,
            name: row.requester.full_name,
            avatar: row.requester.avatar_img,
            banner: row.requester.cover_img,
            mutuals: 0
          }))
      );
    } catch (error) {
      console.error('Failed to load followers:', error);
      this.errorSig.set('Failed to load followers');
    } finally {
      this.loadingSig.set(false);
    }
  }

  async loadFollowing(me: string): Promise<void> {
    try {
      this.loadingSig.set(true);
      this.errorSig.set(null);

      // FIXED: Use the correct FK name
      const { data, error } = await this.supabase
        .from('request_follow')
        .select(`
          requested_id,
          requested:users!fk_request_follow_requested (
            user_id,
            full_name,
            avatar_img,
            cover_img
          )
        `)
        .eq('requester_id', me)
        .eq('status', 'accepted');

      if (error) {
        console.error('Error loading following:', error);
        this.errorSig.set(error.message);
        throw error;
      }

      this.followingSig.set(
        (data ?? [])
          .filter((row: any) => row.requested)
          .map((row: any) => ({
            id: row.requested.user_id,
            name: row.requested.full_name,
            avatar: row.requested.avatar_img,
            banner: row.requested.cover_img,
            mutuals: 0
          }))
      );
    } catch (error) {
      console.error('Failed to load following:', error);
      this.errorSig.set('Failed to load following');
    } finally {
      this.loadingSig.set(false);
    }
  }

  async removeFollower(followerId: string, me: string): Promise<void> {
    try {
      this.errorSig.set(null);

      const { error } = await this.supabase
        .from('request_follow')
        .delete()
        .eq('requester_id', followerId)
        .eq('requested_id', me)
        .eq('status', 'accepted');

      if (error) {
        console.error('Error removing follower:', error);
        this.errorSig.set(error.message);
        throw error;
      }

      this.followersSig.update(list =>
        list.filter(u => u.id !== followerId)
      );
    } catch (error) {
      console.error('Failed to remove follower:', error);
      this.errorSig.set('Failed to remove follower');
      throw error;
    }
  }

  async unfollow(userId: string, me: string): Promise<void> {
    try {
      this.errorSig.set(null);

      const { error } = await this.supabase
        .from('request_follow')
        .delete()
        .eq('requester_id', me)
        .eq('requested_id', userId)
        .eq('status', 'accepted');

      if (error) {
        console.error('Error unfollowing user:', error);
        this.errorSig.set(error.message);
        throw error;
      }

      this.followingSig.update(list =>
        list.filter(u => u.id !== userId)
      );
    } catch (error) {
      console.error('Failed to unfollow user:', error);
      this.errorSig.set('Failed to unfollow user');
      throw error;
    }
  }

  // MESSAGING
  async getOrCreateConversation(me: string, other: string): Promise<string> {
    try {
      this.errorSig.set(null);

      const { data: existing, error: searchError } = await this.supabase
        .from('participants')
        .select('conversation_id')
        .or(
          `and(user_id.eq.${me},other_user_id.eq.${other}),and(user_id.eq.${other},other_user_id.eq.${me})`
        )
        .limit(1);

      if (searchError) {
        console.error('Error searching for conversation:', searchError);
        throw searchError;
      }

      if (existing && existing.length > 0) {
        return existing[0].conversation_id;
      }

      const { data: convo, error: createError } = await this.supabase
        .from('conversations')
        .insert({})
        .select('id')
        .single();

      if (createError) {
        console.error('Error creating conversation:', createError);
        throw createError;
      }

      const { error: participantsError } = await this.supabase
        .from('participants')
        .insert([
          { conversation_id: convo.id, user_id: me, other_user_id: other },
          { conversation_id: convo.id, user_id: other, other_user_id: me }
        ]);

      if (participantsError) {
        console.error('Error creating participants:', participantsError);
        throw participantsError;
      }

      return convo.id;
    } catch (error) {
      console.error('Failed to get or create conversation:', error);
      this.errorSig.set('Failed to create conversation');
      throw error;
    }
  }

  // UTILITY METHODS
  async loadAllData(userId: string): Promise<void> {
    await Promise.all([
      this.loadSuggestions(userId),
      this.loadFriendRequests(userId),
      this.loadFollowers(userId),
      this.loadFollowing(userId)
    ]);
  }

  clearError(): void {
    this.errorSig.set(null);
  }
}