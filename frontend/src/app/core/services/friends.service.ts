import { Injectable, NgZone, signal } from "@angular/core";
import { FriendsProfile } from '../../shared/model/friends-profile.type';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from '../../core/services/supabase.service';


@Injectable({ providedIn: 'root' })

export class FriendsService {

    // nesna3 fi supabase client
    private supabase: SupabaseClient;

    constructor(
        private ngZone: NgZone,
        private supabaseService: SupabaseService
    ) {
        this.supabase = this.supabaseService.client;

        // optional, only for debugging
        try {
            (window as any).supabase = this.supabase;
        } catch { }
    }
    //declarations mta3 el signals
    private allUsersSig = signal<FriendsProfile[]>([]);
    private friendRequestsSig = signal<FriendsProfile[]>([]);
    private followersSig = signal<FriendsProfile[]>([]);
    private followingSig = signal<FriendsProfile[]>([]);
    private suggestionsSig = signal<FriendsProfile[]>([]);

    //variables declaration
    allUsers = this.allUsersSig.asReadonly();
    friendRequests = this.friendRequestsSig.asReadonly();
    followers = this.followersSig.asReadonly();
    following = this.followingSig.asReadonly();
    suggestions = this.suggestionsSig.asReadonly();

    // suggestions
    async loadSuggestions(currentUserId: string) {
        const { data, error } = await this.getSuggestions(currentUserId);
        if (error) throw error;

        const followersMap = await this.getFollowersMap();

        // get my followers
        const { data: myFollowersRows } = await this.supabase
            .from('friends')
            .select('follower_id')
            .eq('followed_id', currentUserId);

        const myFollowersSet = new Set(
            (myFollowersRows ?? []).map(r => r.follower_id)
        );

        const withMutuals = (data ?? []).map(u => ({
            id: u.user_id,
            name: u.full_name,
            avatar: u.avatar_img,
            banner: u.cover_img,
            mutuals: this.countMutuals(u.user_id, myFollowersSet, followersMap)
        }));

        withMutuals.sort((a, b) => b.mutuals - a.mutuals);

        this.suggestionsSig.set(withMutuals);
    }


    private async getSuggestions(me: string) {
        const excludedIds = await this.getExcludedUserIds(me);

        return this.supabase
            .from('users')
            .select('user_id, full_name, avatar_img, cover_img')
            .not('user_id', 'in', `(${excludedIds.join(',')})`);
    }

    private async getExcludedUserIds(me: string) {
        const [friends, requests] = await Promise.all([
            this.supabase
                .from('friends')
                .select('followed_id')
                .eq('follower_id', me),

            this.supabase
                .from('request_follow')
                .select('requester_id, requested_id')
                .eq('status', 'pending')
                .or(`requester_id.eq.${me},requested_id.eq.${me}`)
        ]);

        const excluded = new Set<string>();
        friends.data?.forEach(f => excluded.add(f.followed_id));
        requests.data?.forEach(r => {
            excluded.add(r.requester_id);
            excluded.add(r.requested_id);
        });

        excluded.add(me);
        return Array.from(excluded);
    }

    //suggestions algorithm
    private async getFollowersMap(): Promise<Map<string, string[]>> { //traja3lk el followers lkol mta3 lfriends mta3k
        const { data, error } = await this.supabase
            .from('friends')
            .select('follower_id, followed_id');

        if (error) throw error;

        const map = new Map<string, string[]>();

        (data ?? []).forEach(row => {
            const arr = map.get(row.followed_id) ?? [];
            arr.push(row.follower_id);
            map.set(row.followed_id, arr);
        });

        return map;
    }

    private countMutuals(
        userId: string,
        myFollowers: Set<string>,
        followersMap: Map<string, string[]>
    ): number {
        const theirFollowers = followersMap.get(userId) ?? [];
        let count = 0;

        for (const f of theirFollowers) {
            if (myFollowers.has(f)) count++;
        }

        return count;
    }


    //send follow request logic
    async sendFollowRequest(targetUserId: string, currentUserId: string) {
        const { error } = await this.supabase
            .from('request_follow')
            .insert({
                requester_id: currentUserId,
                requested_id: targetUserId,
                status: 'pending'
            });

        if (error) throw error;

        this.suggestionsSig.update(list =>
            list.filter(u => u.id !== targetUserId)
        );
    }

    //remove from suggestions
    removeFromSuggestions(userId: string) {
        this.suggestionsSig.update(list =>
            list.filter(u => u.id !== userId)
        );
    }

    //load friend requests
    async loadFriendRequests(currentUserId: string) {
        console.log('🔍 Loading friend requests for user:', currentUserId);

        const { data, error } = await this.supabase
            .from('request_follow')
            .select(`
            requester_id,
            requester:users!requester_id (
                user_id,
                full_name,
                avatar_img,
                cover_img
            )
        `)
            .eq('requested_id', currentUserId)
            .eq('status', 'pending');

        if (error) {
            console.error('❌ Friend request error:', error);
            this.friendRequestsSig.set([]);
            return;
        }

        const mapped: FriendsProfile[] = (data ?? [])
            .filter((row: any) => row.requester)
            .map((row: any) => ({
                id: row.requester.user_id,
                name: row.requester.full_name,
                avatar: row.requester.avatar_img,
                banner: row.requester.cover_img,
                mutuals: 0
            }));

        console.log('✅ Mapped friend requests:', mapped);

        this.friendRequestsSig.set(mapped);
    }

    // accept follow request
    async acceptFollowRequest(requesterId: string, currentUserId: string) {
        // 1. Mark request as accepted
        const { error: updateErr } = await this.supabase
            .from('request_follow')
            .update({ status: 'accepted', responded_at: new Date().toISOString() })
            .eq('requester_id', requesterId)
            .eq('requested_id', currentUserId);

        if (updateErr) throw updateErr;

        // 2. Create friendship (follower -> followed)
        const { error: friendErr } = await this.supabase
            .from('friends')
            .insert({
                follower_id: requesterId,
                followed_id: currentUserId
            });

        if (friendErr) throw friendErr;

        // 3. Update UI (remove request)
        this.friendRequestsSig.update(list =>
            list.filter(u => u.id !== requesterId)
        );
    }

    // reject Follow Request
    async rejectFollowRequest(requesterId: string, currentUserId: string) {
        const { error } = await this.supabase
            .from('request_follow')
            .update({ status: 'rejected', responded_at: new Date().toISOString() })
            .eq('requester_id', requesterId)
            .eq('requested_id', currentUserId);

        if (error) throw error;

        // Remove from UI
        this.friendRequestsSig.update(list =>
            list.filter(u => u.id !== requesterId)
        );
    }

    // people who follow me
    async loadFollowers(currentUserId: string) {
        console.log('🔍 Loading followers for user:', currentUserId);

        const { data, error } = await this.supabase
            .from('request_follow')
            .select(`
            requester_id,
            requester:users!requester_id (
                user_id,
                full_name,
                avatar_img,
                cover_img
            )
        `)
            .eq('requested_id', currentUserId)
            .eq('status', 'accepted');

        if (error) throw error;

        const mapped: FriendsProfile[] = (data ?? [])
            .filter((row: any) => row.users)
            .map((row: any) => ({
                id: row.users.user_id,
                name: row.users.full_name,
                avatar: row.users.avatar_img,
                banner: row.users.cover_img,
                mutuals: 0
            }));

        this.followersSig.set(mapped);

        console.log('✅ Followers loaded:', mapped);
    }

    // people i follow
    async loadFollowing(currentUserId: string) {
        console.log('🔍 Loading following for user:', currentUserId);

        const { data, error } = await this.supabase
            .from('request_follow')
            .select(`
            requested_id,
            requester:users!requester_id (
                user_id,
                full_name,
                avatar_img,
                cover_img
            )
        `)
            .eq('requester_id', currentUserId)
            .eq('status', 'accepted');

        if (error) throw error;

        const mapped: FriendsProfile[] = (data ?? [])
            .filter((row: any) => row.users)
            .map((row: any) => ({
                id: row.users.user_id,
                name: row.users.full_name,
                avatar: row.users.avatar_img,
                banner: row.users.cover_img,
                mutuals: 0
            }));

        this.followersSig.set(mapped);

        console.log('✅ Following loaded:', mapped);
    }





}