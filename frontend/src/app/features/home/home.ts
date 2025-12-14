// home.ts - FIXED VERSION with proper suggestions
import { Component, ElementRef, OnInit } from '@angular/core';
import { FlurrCreationCard } from '../../shared/components/flurr-creation-card/flurr-creation-card';
import { CardPanel } from '../../shared/components/card-panel/card-panel';
import { MiniProfileCard } from '../../shared/components/mini-profile-card/mini-profile-card';
import { Post } from '../../shared/components/post-components/post/post';
import { NgIf, NgForOf, NgFor } from '@angular/common';
import { Router } from '@angular/router';
import { supabase } from '../../core/supabase/supabase.client';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/auth/auth.service';
import { FriendsService } from '../../core/services/friends.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    FlurrCreationCard,
    CardPanel,
    MiniProfileCard,
    Post,
    NgIf,
    NgFor
  ],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home implements OnInit {

  loading = false;
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
    private authService: AuthService,
    private friendsService: FriendsService
  ) {}

  ngOnInit(): void {
    this.loadAllData();

    supabase.auth.onAuthStateChange(() => {
      this.loadAllData();
    });
  }

  // Handle when a post is changed (follow/unfollow)
  onPostChanged() {
    console.log('Post changed - refreshing feed');
    // Small delay to ensure database transaction is complete
    setTimeout(() => {
      this.loadAllData();
    }, 300);
  }

  async loadAllData() {
    this.loading = true;
    this.error = '';

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const uid = sessionData.session?.user?.id ?? this.authService.getUserId() ?? null;

      console.log('Home - Loading data for user:', uid);

      if (uid) {
        const result = await this.userService.loadFromAuthUserId(uid);
        console.log('Home - User loaded:', result.data);
      } else {
        this.userService.clearUser();
      }

      // -------------------------------------------------
      // 1) GET FRIENDS (people I follow) - ONLY FRIENDS, NOT ME
      // -------------------------------------------------
      let feedAuthorIds: string[] = [];
      if (uid) {
        const { data: friends, error: friendsErr } = await supabase
          .from('friends')
          .select('followed_id')
          .eq('follower_id', uid)
          .neq('followed_id', uid);

        if (friendsErr) {
          console.warn('friendsErr:', friendsErr);
        } else if (friends && friends.length > 0) {
          const friendIds = friends.map((f: any) => f.followed_id as string);
          feedAuthorIds = Array.from(new Set(friendIds)).filter(id => id !== uid);
        }
      }

      console.log("UID =", uid);
<<<<<<< HEAD
      console.log("FEED AUTHOR IDS =", feedAuthorIds);
=======
      console.log("FRIENDS (feed authors) =", feedAuthorIds);
      console.log("Number of friends:", feedAuthorIds.length);
>>>>>>> f2bb757212641971b5a5bf66d8a611b66923becc

      if (!uid || feedAuthorIds.length === 0) {
        this.posts = [];
        console.log("No friends to show posts from - feed will be empty");
      }

      // -------------------------------------------------
      // 2) FLURRS from friends ONLY (not your own posts)
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
          .in('poster_id', feedAuthorIds)
          .neq('poster_id', uid)
          .order('created_at', { ascending: false })
          .limit(100);

        if (flurrsErr) {
          console.warn('flurrsErr:', flurrsErr);
        } else if (flurrsData) {
          flurrs = flurrsData as any[];
          console.log(`Loaded ${flurrs.length} posts from ${feedAuthorIds.length} friends`);
          
          if (flurrs.length > 0) {
            const posterIds = flurrs.map(f => f.poster_id);
            console.log("Poster IDs in feed:", posterIds);
            console.log("Your ID:", uid);
            
            flurrs = flurrs.filter(f => f.poster_id !== uid);
            console.log(`After filtering: ${flurrs.length} posts`);
          }
        }
      } else {
        console.log("No friends followed - feed will be empty");
      }

      // -------------------------------------------------
      // 3) LOAD LIKES AND COMMENTS COUNTS
      // -------------------------------------------------
      const flurrIds = flurrs.map(f => f.flurr_id);
      
      const likesMap = new Map<string, number>();
      if (flurrIds.length > 0) {
        const { data: likesData } = await supabase
          .from('flurr_action')
          .select('flurr_id')
          .in('flurr_id', flurrIds)
          .eq('is_liked', true);

        if (likesData) {
          for (const like of likesData) {
            const count = likesMap.get(like.flurr_id) || 0;
            likesMap.set(like.flurr_id, count + 1);
          }
        }
      }

      const commentsMap = new Map<string, number>();
      if (flurrIds.length > 0) {
        const { data: commentsData } = await supabase
          .from('flurr_action')
          .select('flurr_id, comment_id')
          .in('flurr_id', flurrIds)
          .not('comment_id', 'is', null);

        if (commentsData) {
          for (const comment of commentsData) {
            const count = commentsMap.get(comment.flurr_id) || 0;
            commentsMap.set(comment.flurr_id, count + 1);
          }
        }
      }

      // -------------------------------------------------
      // 4) CHECK USER'S LIKE STATUS FOR EACH POST
      // -------------------------------------------------
      const userLikesMap = new Map<string, boolean>();
      if (uid && flurrIds.length > 0) {
        const { data: userLikes } = await supabase
          .from('flurr_action')
          .select('flurr_id')
          .eq('user_id', uid)
          .in('flurr_id', flurrIds)
          .eq('is_liked', true);

        if (userLikes) {
          for (const like of userLikes) {
            userLikesMap.set(like.flurr_id, true);
          }
        }
      }

      // -------------------------------------------------
      // 5) MAP POSTS WITH PROPER COUNTS
      // -------------------------------------------------
      this.posts = flurrs.map((r: any) => {
        const posterRaw = r.poster;
        const poster = Array.isArray(posterRaw) ? posterRaw[0] : posterRaw;

        const author = poster
          ? {
              id: poster.user_id,
              name: poster.full_name || (poster.email?.split('@')[0] ?? 'Unknown'),
              avatarUrl: poster.avatar_img || './assets/images/hama.png',
              isFollowed: true
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
          reactions: { 
            like: likesMap.get(r.flurr_id) || 0 
          },
          commentsCount: commentsMap.get(r.flurr_id) || 0,
          userHasLiked: userLikesMap.get(r.flurr_id) || false
        };
      });

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
      // FRIENDS SUGGESTIONS - USING FRIENDSSERVICE
      // -------------------------------------------------
      if (uid) {
        try {
          await this.friendsService.loadSuggestions(uid);
          const suggestions = this.friendsService.suggestions();
          
          this.friendsSuggestions = suggestions.slice(0, 6).map(u => ({
            id: u.id,
            title: u.name,
            imageUrl: u.avatar || './assets/images/hama.png',
            withSubtitle: true,
            subtitle: u.mutuals > 0 ? `${u.mutuals} mutual${u.mutuals > 1 ? 's' : ''}` : 'Suggested user',
            withButton: true,
            buttonText: 'Follow',
            buttonAction: () => this.followUser(u.id)
          }));
          
          console.log('Loaded suggestions:', this.friendsSuggestions.length);
        } catch (suggestionError) {
          console.error('Error loading suggestions:', suggestionError);
          // Fallback to empty array if suggestions fail
          this.friendsSuggestions = [];
        }
      } else {
        this.friendsSuggestions = [];
      }

    } catch (e: any) {
      console.error('loadAllData error:', e);
      this.error = e?.message ?? 'Error loading data';
    } finally {
      this.loading = false;
    }
  }

  applySorting() {
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
    const ageHours = Math.max(1, (now - created) / 3_600_000);

    const likes = p.reactions?.['like'] ?? 0;
    const comments = p.commentsCount ?? 0;

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
    
    try {
      await supabase.from('friends').insert([{ follower_id: uid, followed_id: userId }]);
      
      // Remove from suggestions list immediately
      this.friendsSuggestions = this.friendsSuggestions.filter(u => u.id !== userId);
      
      console.log(`Followed user ${userId}`);
      
      // Refresh feed to show new friend's posts
      this.loadAllData();
    } catch (error) {
      console.error('Error following user:', error);
    }
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