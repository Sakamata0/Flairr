// src/app/features/profile/profile.ts
import { Component, ElementRef, OnInit } from '@angular/core';
import { ProfileHeader } from "../../shared/components/profile/profile-header/profile-header";
import { CardPanel } from "../../shared/components/card-panel/card-panel";
import { FlurrCreationCard } from "../../shared/components/flurr-creation-card/flurr-creation-card";
import { Post } from "../../shared/components/post-components/post/post";
import { Router, ActivatedRoute } from '@angular/router';
import { NgIf, NgForOf } from '@angular/common';
import { JourneysSelector } from "../../shared/components/profile/journeys-selector/journeys-selector";

import { supabase } from '../../core/supabase/supabase.client';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/auth/auth.service';
import { FlurrsService } from '../../core/services/flurrs.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ProfileHeader, CardPanel, FlurrCreationCard, Post, NgIf, NgForOf, JourneysSelector],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class Profile implements OnInit {

  loading = false;
  error = '';

  profile: any = null;
  posts: any[] = [];
  FlairrSpaces: any[] = [];

  isOwnProfile = false;

  sortType: string = 'Top';
  sortingPostsMethodOpen: boolean = false;

  constructor(
    private elementRef: ElementRef<HTMLElement>,
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private authService: AuthService,
    private flurrsService: FlurrsService 
  ) {}


  ngOnInit(): void {
    this.loadProfileFromRoute();
    supabase.auth.onAuthStateChange(() => this.loadProfileFromRoute());
  }

  selectedJourneyId: string | null = null;
  selectedYear: string | null = null;

  async onJourneySelectionChange(event: {
    journeyId: string | null;
    year: string | null;
  }) {
    this.selectedJourneyId = event.journeyId;
    this.selectedYear = event.year;

    await this.loadProfileFromRoute();
  }


  async loadProfileFromRoute() {
    this.loading = true;
    this.error = '';
    this.profile = null;
    this.posts = [];
    this.FlairrSpaces = [];
    this.isOwnProfile = false;

    try {
      const routeId = this.route.snapshot.paramMap.get('id');
      const { data: sessionData } = await supabase.auth.getSession();
      const currentUid = sessionData.session?.user?.id ?? this.authService.getUserId();

      const targetId = routeId ?? currentUid;
      console.log('[Profile] IDs:', { routeId, currentUid, targetId });

      if (!targetId) {
        this.error = 'No profile selected and no user logged in.';
        return;
      }

      this.isOwnProfile = targetId === currentUid;

      const { data: userRow, error: userErr } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', targetId)
        .single();

      if (userErr) {
        console.error('[Profile] userErr', userErr);
        this.error = userErr.message;
        return;
      }

      this.profile = userRow;

      this.userService.setUser({
        userID: userRow.user_id,
        fullName: userRow.full_name ?? '',
        email: userRow.email ?? '',
        bio: userRow.bio ?? '',
        avatarImg: userRow.avatar_img ?? '',
        coverImg: userRow.cover_img ?? '',
        followers: [],
        following: [],
        journeys: [],
        flurrs:[],
        spacesCreated: [],
        spacesJoined: [],
        getUser() { throw new Error('not implemented'); },
        editProfile() { throw new Error('not implemented'); }
      });

      // -------------------------
      // LOAD POSTS (flurrs)
      // -------------------------
      try {
        this.posts = await this.flurrsService.getUserFlurrs(
          currentUid!,
          this.selectedJourneyId,
          this.selectedYear
        );
      } catch (err) {
        console.warn('[Profile] flurrsErr', err);
        this.posts = [];
      }


      // -------------------------
      // LOAD SPACES OWNED
      // -------------------------
      const { data: spaces, error: spacesErr } = await supabase
        .from('spaces')
        .select('*')
        .eq('space_owner', targetId);

      if (spacesErr) console.warn('[Profile] spacesErr', spacesErr);

      this.FlairrSpaces = (spaces ?? []).map((s: any) => ({
        id: s.space_id,
        title: s.space_name,
        imageUrl: s.avatar_img || './assets/images/hama.png',
        withSubtitle: !!s.space_bio,
        subtitle: s.space_bio ?? '',
        withButton: true,
        buttonText: 'Visit',
        buttonAction: () => this.router.navigate(['/space', s.space_id])
      }));

    } catch (err: any) {
      console.error('[Profile] unexpected error', err);
      this.error = err?.message ?? 'Unexpected error';
    } finally {
      this.loading = false;
      console.log('[Profile] Loaded:', { profile: this.profile, posts: this.posts });
    }
  }

  toggleSortingMethodMenu(ev?: Event) {
    ev?.stopPropagation();
    this.sortingPostsMethodOpen = !this.sortingPostsMethodOpen;
  }
}
