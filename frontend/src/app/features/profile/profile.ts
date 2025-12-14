// profile.ts - FIXED VERSION with proper route parameter handling
import { Component, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { ProfileHeader } from "../../shared/components/profile/profile-header/profile-header";
import { CardPanel } from "../../shared/components/card-panel/card-panel";
import { FlurrCreationCard } from "../../shared/components/flurr-creation-card/flurr-creation-card";
import { Post } from "../../shared/components/post-components/post/post";
import { Router, ActivatedRoute } from '@angular/router';
import { NgIf, NgForOf } from '@angular/common';
import { JourneysSelector } from "../../shared/components/profile/journeys-selector/journeys-selector";
import { Subscription } from 'rxjs';

import { supabase } from '../../core/supabase/supabase.client';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ProfileHeader, CardPanel, FlurrCreationCard, Post, NgIf, NgForOf, JourneysSelector],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class Profile implements OnInit, OnDestroy {

  loading: boolean = true;
  error = '';

  profile: any = null;
  posts: any[] = [];
  FlairrSpaces: any[] = [];

  isOwnProfile = false;

  sortType: string = 'Top';
  sortingPostsMethodOpen: boolean = false;

  private paramSubscription?: Subscription;

  constructor(
    private elementRef: ElementRef<HTMLElement>,
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Subscribe to route parameter changes
    this.paramSubscription = this.route.paramMap.subscribe(params => {
      console.log('[Profile] Route params changed:', params.get('id'));
      this.loadProfileFromRoute();
    });

    // Also reload when auth state changes
    supabase.auth.onAuthStateChange(() => {
      this.loadProfileFromRoute();
    });
  }

  ngOnDestroy(): void {
    this.paramSubscription?.unsubscribe();
  }

  async loadProfileFromRoute() {
    this.error = '';
    this.profile = null;
    this.posts = [];
    this.FlairrSpaces = [];
    this.isOwnProfile = false;

    try {
      // Get the user ID from the route parameter
      // The route is defined as 'profile/:profileId' so we need to use 'profileId'
      const routeId = this.route.snapshot.paramMap.get('profileId');
      
      // Get the current logged-in user ID
      const { data: sessionData } = await supabase.auth.getSession();
      const currentUid = sessionData.session?.user?.id ?? this.authService.getUserId();

      // Log ALL route params to debug
      console.log('[Profile] ALL ROUTE PARAMS:', this.route.snapshot.paramMap.keys);
      this.route.snapshot.paramMap.keys.forEach(key => {
        console.log(`  - ${key}: ${this.route.snapshot.paramMap.get(key)}`);
      });
      console.log('[Profile] Loading profile:', { routeId, currentUid, url: this.router.url });

      // Determine which profile to load
      let targetId: string;
      
      if (routeId) {
        // If there's a route ID, always use it (viewing someone else's profile)
        targetId = routeId;
        this.isOwnProfile = routeId === currentUid;
      } else if (currentUid) {
        // No route ID means we're at /profile, show current user's profile
        targetId = currentUid;
        this.isOwnProfile = true;
      } else {
        this.error = 'No profile selected and no user logged in.';
        this.loading = false;
        return;
      }

      console.log('[Profile] Target ID:', targetId, 'Is own profile:', this.isOwnProfile);

      // -------------------------
      // LOAD USER PROFILE
      // -------------------------
      const { data: userRow, error: userErr } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', targetId)
        .single();

      if (userErr || !userRow) {
        console.error('[Profile] userErr', userErr);
        this.error = userErr?.message ?? 'User not found';
        this.loading = false;
        return;
      }

      console.log('[Profile] Loaded user:', userRow.full_name);

      // -------------------------
      // LOAD FOLLOWERS COUNT
      // -------------------------
      const { count: followersCount } = await supabase
        .from('friends')
        .select('*', { count: 'exact', head: true })
        .eq('followed_id', targetId);

      // -------------------------
      // LOAD FOLLOWING COUNT
      // -------------------------
      const { count: followingCount } = await supabase
        .from('friends')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', targetId);

      // -------------------------
      // LOAD FOLLOWERS LIST (for display)
      // -------------------------
      const { data: followersData } = await supabase
        .from('friends')
        .select(`
          follower_id,
          follower:follower_id(user_id, full_name, avatar_img)
        `)
        .eq('followed_id', targetId);

      const followersDisplay = (followersData || []).map((f: any) => {
        const follower = Array.isArray(f.follower) ? f.follower[0] : f.follower;
        return {
          id: follower?.user_id || f.follower_id,
          name: follower?.full_name || 'Unknown',
          avatarUrl: follower?.avatar_img || './assets/images/hama.png'
        };
      });

      const followersIds = (followersData || []).map((f: any) => f.follower_id);

      // -------------------------
      // LOAD FOLLOWING LIST (for display)
      // -------------------------
      const { data: followingData } = await supabase
        .from('friends')
        .select(`
          followed_id,
          followed:followed_id(user_id, full_name, avatar_img)
        `)
        .eq('follower_id', targetId);

      const followingDisplay = (followingData || []).map((f: any) => {
        const followed = Array.isArray(f.followed) ? f.followed[0] : f.followed;
        return {
          id: followed?.user_id || f.followed_id,
          name: followed?.full_name || 'Unknown',
          avatarUrl: followed?.avatar_img || './assets/images/hama.png'
        };
      });

      const followingIds = (followingData || []).map((f: any) => f.followed_id);

      // -------------------------
      // LOAD POSTS (flurrs)
      // -------------------------
      const { data: flurrs, error: flurrsErr } = await supabase
        .from('flurrs')
        .select('*')
        .eq('poster_id', targetId)
        .order('created_at', { ascending: false });

      console.log('[Profile] flurrs result:', { count: flurrs?.length, error: flurrsErr });

      if (flurrsErr) console.warn('[Profile] flurrsErr', flurrsErr);
      this.posts = flurrs ?? [];

      // -------------------------
      // LOAD SPACES OWNED/JOINED
      // -------------------------
      const { data: ownedSpaces } = await supabase
        .from('spaces')
        .select('*')
        .eq('space_owner', targetId);

      const { data: joinedSpaces } = await supabase
        .from('spaces')
        .select(`
          space_id,
          space:space_id(space_id, space_name, space_bio, avatar_img, space_owner)
        `)
        .eq('user_id', targetId);

      // Combine owned and joined spaces
      const allSpaces = new Map();
      
      (ownedSpaces || []).forEach((s: any) => {
        allSpaces.set(s.space_id, s);
      });

      (joinedSpaces || []).forEach((sj: any) => {
        const space = Array.isArray(sj.space) ? sj.space[0] : sj.space;
        if (space && !allSpaces.has(space.space_id)) {
          allSpaces.set(space.space_id, space);
        }
      });

      this.FlairrSpaces = Array.from(allSpaces.values()).map((s: any) => ({
        id: s.space_id,
        title: s.space_name,
        imageUrl: s.avatar_img || './assets/images/hama.png',
        withSubtitle: !!s.space_bio,
        subtitle: s.space_bio ?? '',
        withButton: true,
        buttonText: 'Visit',
        buttonAction: () => this.router.navigate(['/space', s.space_id])
      }));

      // -------------------------
      // BUILD COMPLETE PROFILE OBJECT
      // -------------------------
      this.profile = {
        user_id: userRow.user_id,
        full_name: userRow.full_name,
        username: userRow.username,
        email: userRow.email,
        bio: userRow.bio,
        avatar_img: userRow.avatar_img,
        cover_img: userRow.cover_img,
        followers: followersDisplay,
        following: followingDisplay,
        flurrs: flurrs || [],
        spacesCreated: ownedSpaces || [],
        spacesJoined: Array.from(allSpaces.values())
      };

      // -------------------------
      // UPDATE USERSERVICE (if viewing own profile)
      // -------------------------
      if (this.isOwnProfile && currentUid) {
        this.userService.setUser({
          userID: userRow.user_id,
          fullName: userRow.full_name ?? '',
          email: userRow.email ?? '',
          bio: userRow.bio ?? '',
          avatarImg: userRow.avatar_img ?? '',
          coverImg: userRow.cover_img ?? '',
          followers: followersIds,
          following: followingIds,
          journeys: [],
          flurrs: flurrs || [],
          spacesCreated: ownedSpaces || [],
          spacesJoined: Array.from(allSpaces.values()),
          getUser() { throw new Error('not implemented'); },
          editProfile() { throw new Error('not implemented'); }
        });
      }

      console.log('[Profile] Complete profile loaded:', {
        user: this.profile.full_name,
        userId: this.profile.user_id,
        isOwnProfile: this.isOwnProfile,
        followers: followersDisplay.length,
        following: followingDisplay.length,
        posts: this.posts.length,
        spaces: this.FlairrSpaces.length
      });

    } catch (err: any) {
      console.error('[Profile] unexpected error', err);
      this.error = err?.message ?? 'Unexpected error';
    } finally {
      this.loading = false;
    }
  }

  applySorting() {
    if (!this.posts || this.posts.length === 0) return;

    if (this.sortType === 'Recent') {
      this.posts.sort((a: any, b: any) => {
        const dateA = new Date(a.created_at || a.date_publish).getTime();
        const dateB = new Date(b.created_at || b.date_publish).getTime();
        return dateB - dateA;
      });
    } else if (this.sortType === 'Top') {
      this.posts.sort((a: any, b: any) => {
        return this.computeScore(b) - this.computeScore(a);
      });
    }

    console.log(`[Profile] Sorted ${this.posts.length} posts by ${this.sortType}`);
  }

  private computeScore(post: any): number {
    const now = Date.now();
    const created = new Date(post.created_at || post.date_publish).getTime();
    const ageHours = Math.max(1, (now - created) / 3_600_000);

    const likes = post.likes_count ?? 0;
    const comments = post.comments_count ?? 0;

    const engagement = likes * 3 + comments * 4;
    const decay = ageHours * 0.5;

    return engagement - decay;
  }

  toggleSortingMethodMenu(ev?: Event) {
    ev?.stopPropagation();
    this.sortingPostsMethodOpen = !this.sortingPostsMethodOpen;
  }
}