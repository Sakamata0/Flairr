// src/app/features/home/home.ts
import { Component, ElementRef, OnInit } from '@angular/core';
import { FlurrCreationCard } from '../../shared/components/flurr-creation-card/flurr-creation-card';
import { CardPanel } from '../../shared/components/card-panel/card-panel';
import { MiniProfileCard } from '../../shared/components/mini-profile-card/mini-profile-card';
import { Post } from '../../shared/components/post-components/post/post';
import { NgIf, NgForOf } from '@angular/common';
import { Router } from '@angular/router';
import { supabase } from '../../core/supabase/supabase.client';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    FlurrCreationCard,
    CardPanel,
    MiniProfileCard,
    Post,
    NgIf,
    NgForOf
  ],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home implements OnInit {
  loading = true;
  error = '';

  shortcuts: any[] = [];
  notifications: any[] = [];
  friendsSuggestions: any[] = [];
  posts: any[] = [];

  sortType: string = 'Top';
  sortingPostsMethodOpen: boolean = false;

  constructor(
    private elementRef: ElementRef<HTMLElement>,
    private router: Router,
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadAllData();

    supabase.auth.onAuthStateChange(() => {
      this.loadAllData();
    });
  }

  async loadAllData() {
    this.error = '';

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const uid = sessionData.session?.user?.id ?? this.authService.getUserId() ?? null;

      if (uid) {
        await this.userService.loadFromAuthUserId(uid);
      } else {
        this.userService.clearUser();
      }

      // -------------------------------------------------
      // 1) GET FRIENDS (people I follow)
      // -------------------------------------------------
      let feedAuthorIds: string[] = [];
      if (uid) {
        const { data: friends, error: friendsErr } = await supabase
          .from('friends')
          .select('followed_id')
          .eq('follower_id', uid);

        if (friendsErr) {
          console.warn('friendsErr:', friendsErr);
        } else if (friends) {
          const friendIds = friends.map((f: any) => f.followed_id as string);
          feedAuthorIds = Array.from(new Set(friendIds));
        }
      }

      // If no logged user or no friends, you can decide:
      // Option A: show nothing
      // Option B: show only my own posts (if uid)
      if (!uid) {
        this.posts = [];
      } else if (feedAuthorIds.length === 0) {
        // fall back: only my posts
        feedAuthorIds = [uid];
      }
      console.log("UID =", uid);
      console.log("FEED AUTHOR IDS =", feedAuthorIds);


      // -------------------------------------------------
      // 2) FLURRS for those authors only
      // -------------------------------------------------
      let flurrs: any[] = [];

      if (feedAuthorIds.length > 0) {
        const { data: flurrsData, error: flurrsErr } = await supabase
          .from('flurrs')
          .select(`
            flurr_id,
            type,
            content,
            date_publish,
            created_at,
            poster_id,
            poster:poster_id(
              user_id,
              full_name,
              avatar_img,
              email
            )
          `)
          .in('poster_id', feedAuthorIds)   // ⭐ only friends + me
          .order('created_at', { ascending: false })
          .limit(100); // a bit larger since we filter

        if (flurrsErr) {
          console.warn('flurrsErr:', flurrsErr);
        } else if (flurrsData) {
          flurrs = flurrsData as any[];
        }
      }

      // Map + normalize posts
      this.posts = flurrs.map((r: any) => {
        const posterRaw = r.poster;
        const poster = Array.isArray(posterRaw) ? posterRaw[0] : posterRaw;

        const author = poster
          ? {
              id: poster.user_id,
              name: poster.full_name || (poster.email?.split('@')[0] ?? 'Unknown'),
              avatarUrl: poster.avatar_img || './assets/images/hama.png',
              isFollowed: true // if it's in feed, we already follow them
            }
          : {
              id: r.poster_id,
              name: 'Unknown',
              avatarUrl: './assets/images/hama.png',
              isFollowed: false
            };

        return {
          ...r,
          id: r.flurr_id,
          author,
          createdAt: new Date(r.created_at),
          // default stats; can be updated later when you add aggregation
          reactions: r.reactions ?? { like: 0 },
          commentsCount: r.commentsCount ?? 0
        };
      });

      // Apply ranking (Top or Recent)
      this.applySorting();

      // -------------------------------------------------
      // SPACES — SHORTCUTS
      // -------------------------------------------------
      const { data: spaces } = await supabase
        .from('spaces')
        .select('space_id, space_name, space_bio, avatar_img')
        .order('created_at', { ascending: false })
        .limit(12);

      if (spaces) {
        this.shortcuts = spaces.map((s: any) => ({
          id: s.space_id,
          title: s.space_name,
          imageUrl: s.avatar_img || './assets/images/hama.png',
          withSubtitle: !!s.space_bio,
          subtitle: s.space_bio ?? '',
          withButton: true,
          buttonText: 'Visit',
          buttonAction: () => {
            console.log('VISIT CLICKED', s.space_id);
            this.router.navigate(['/spaces', s.space_id])
          }
        }));
      }

      // -------------------------------------------------
      // NOTIFICATIONS
      // -------------------------------------------------
      if (uid) {
        const { data: notifs } = await supabase
          .from('notifications')
          .select('notification_id, type, content, actor_id, flurr_id, created_at')
          .eq('user_id', uid)
          .order('created_at', { ascending: false })
          .limit(20);

        if (notifs) {
          this.notifications = await Promise.all(
            notifs.map(async (n: any) => {
              let actor = { full_name: 'Someone', avatar_img: './assets/images/hama.png' };

              if (n.actor_id) {
                const { data: actorRow } = await supabase
                  .from('users')
                  .select('full_name, avatar_img')
                  .eq('user_id', n.actor_id)
                  .single();

                if (actorRow) {
                  actor.full_name = actorRow.full_name;
                  actor.avatar_img = actorRow.avatar_img || './assets/images/hama.png';
                }
              }

              return {
                id: n.notification_id,
                title: actor.full_name,
                imageUrl: actor.avatar_img,
                withSubtitle: true,
                subtitle: n.content,
                subtitleOnSameLevel: true,
                withIcon: true,
                iconUrl: this.iconForNotificationType(n.type)
              };
            })
          );
        }
      }

      // -------------------------------------------------
      // FRIENDS SUGGESTIONS (users you don't follow yet)
      // -------------------------------------------------
      const { data: users } = await supabase
        .from('users')
        .select('user_id, full_name, avatar_img')
        .neq('user_id', uid ?? '')
        .limit(6);

      if (users) {
        this.friendsSuggestions = users.map(u => ({
          id: u.user_id,
          title: u.full_name,
          imageUrl: u.avatar_img || './assets/images/hama.png',
          withSubtitle: true,
          subtitle: 'Suggested user',
          withButton: true,
          buttonText: 'Follow',
          buttonAction: () => this.followUser(u.user_id)
        }));
      }

    } catch (e: any) {
      console.error('loadAllData error:', e);
      this.error = e?.message ?? 'Error loading data';
    } finally {
      this.loading = false;
    }
  }

  // ---------------------------
  // FEED SORTING / ALGORITHM
  // ---------------------------
  private applySorting() {
    if (!this.posts || this.posts.length === 0) return;

    if (this.sortType === 'Recent') {
      this.posts.sort((a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (this.sortType === 'Top') {
      this.posts.sort((a: any, b: any) =>
        this.computeScore(b) - this.computeScore(a)
      );
    }
  }

  private computeScore(p: any): number {
    const now = Date.now();
    const created = new Date(p.createdAt).getTime();
    const ageHours = Math.max(1, (now - created) / 3_600_000); // avoid div/0

    const likes = p.reactions?.['like'] ?? 0;
    const comments = p.commentsCount ?? 0;

    // Simple scoring formula: likes & comments vs age
    const engagement = likes * 3 + comments * 4;
    const decay = ageHours * 0.5;

    return engagement - decay;
  }

  private iconForNotificationType(type: string) {
    if (!type) return 'assets/icons/panel/notification.png';
    if (type.includes('like')) return 'assets/icons/panel/like.png';
    if (type.includes('comment')) return 'assets/icons/panel/comment.png';
    return 'assets/icons/panel/notification.png';
  }

  async followUser(userId: string) {
    const uid = await this.getUid();
    if (!uid) return;
    await supabase.from('friends').insert([{ follower_id: uid, followed_id: userId }]);
    this.friendsSuggestions = this.friendsSuggestions.filter(u => u.id !== userId);
  }

  private async getUid() {
    const { data } = await supabase.auth.getSession();
    return data.session?.user?.id ?? null;
  }

  toggleSortingMethodMenu(event?: Event) {
    event?.stopPropagation();
    this.sortingPostsMethodOpen = !this.sortingPostsMethodOpen;
  }
}
