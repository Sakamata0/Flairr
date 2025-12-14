// flurr-space-profile.ts
import { Component, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIf, NgForOf } from '@angular/common';
import { Subscription } from 'rxjs';

import { CardPanel } from '../../shared/components/card-panel/card-panel';
import { Post } from '../../shared/components/post-components/post/post';
import { ProfileHeader } from '../../shared/components/profile/profile-header/profile-header';
import { SpaceFlurrCreationCard } from '../../shared/components/space-flurr-creation-card/space-flurr-creation-card';

import { supabase } from '../../core/supabase/supabase.client';

@Component({
  selector: 'app-flurr-space-profile',
  standalone: true,
  imports: [
    ProfileHeader,
    SpaceFlurrCreationCard,
    CardPanel,
    Post,
    NgIf,
    NgForOf
  ],
  templateUrl: './flurr-space-profile.html',
  styleUrls: ['./flurr-space-profile.css']
})
export class FlurrSpaceProfile implements OnInit, OnDestroy {

  loading = false;
  error = '';

  space: any = null;
  posts: any[] = [];
  invitations: any[] = [];
  spaceId: any = null;

  sortType: string = 'Top';
  sortingPostsMethodOpen = false;

  private paramSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private elementRef: ElementRef<HTMLElement>
  ) {}

  // -----------------------------
  // LIFECYCLE
  // -----------------------------
  ngOnInit(): void {
    this.paramSub = this.route.paramMap.subscribe(() => {
      this.loadSpaceFromRoute();
    });
  }

  ngOnDestroy(): void {
    this.paramSub?.unsubscribe();
  }

  // -----------------------------
  // MAIN LOADER
  // -----------------------------
  async loadSpaceFromRoute() {
    this.loading = true;
    this.error = '';
    this.space = null;
    this.posts = [];

    try {
      this.spaceId = this.route.snapshot.paramMap.get('spaceId');

      if (!this.spaceId) {
        this.error = 'No space selected.';
        return;
      }

      console.log('[SpaceProfile] Loading space:', this.spaceId);

      // -------------------------
      // LOAD SPACE
      // -------------------------
      const { data: spaceRow, error: spaceErr } = await supabase
        .from('spaces')
        .select('*')
        .eq('space_id', this.spaceId)
        .single();

      if (spaceErr || !spaceRow) {
        this.error = spaceErr?.message ?? 'Space not found';
        return;
      }

      // -------------------------
      // LOAD POSTS IN SPACE
      // -------------------------
      const { data: flurrs, error: flurrErr } = await supabase
        .from('flurrs')
        .select(`
          *,
          poster:poster_id(user_id, full_name, avatar_img)
        `)
        .eq('space_id', this.spaceId)
        .order('created_at', { ascending: false });

      if (flurrErr) {
        console.warn('[SpaceProfile] flurrErr', flurrErr);
      }

      this.posts = flurrs ?? [];

      // -------------------------
      // FINAL SPACE OBJECT
      // -------------------------
      this.space = {
        space_id: spaceRow.space_id, // 5alli hakka pour le moment
        fullName: spaceRow.space_name,
        bio: spaceRow.space_bio,
        avatar_img: spaceRow.avatar_img,
        cover_img: spaceRow.cover_img,
        owner_id: spaceRow.space_owner,
        created_at: spaceRow.created_at
      };

      this.applySorting();

      console.log('[SpaceProfile] Loaded:', {
        space: this.space.spacename,
        posts: this.posts.length
      });

    } catch (err: any) {
      console.error('[SpaceProfile] Unexpected error', err);
      this.error = err?.message ?? 'Unexpected error';
    } finally {
      this.loading = false;
    }
  }

  // -----------------------------
  // SORTING
  // -----------------------------
  applySorting() {
    if (!this.posts.length) return;

    if (this.sortType === 'Recent') {
      this.posts.sort((a, b) =>
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
      );
    } else {
      this.posts.sort((a, b) =>
        this.computeScore(b) - this.computeScore(a)
      );
    }
  }

  private computeScore(post: any): number {
    const now = Date.now();
    const created = new Date(post.created_at).getTime();
    const ageHours = Math.max(1, (now - created) / 3_600_000);

    const likes = post.likes_count ?? 0;
    const comments = post.comments_count ?? 0;

    return (likes * 3 + comments * 4) - ageHours * 0.5;
  }

  toggleSortingMethodMenu(ev?: Event) {
    ev?.stopPropagation();
    this.sortingPostsMethodOpen = !this.sortingPostsMethodOpen;
  }
}
