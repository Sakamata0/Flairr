import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Post } from '../../shared/components/post-components/post/post';
import { supabase } from '../../core/supabase/supabase.client';
import { PostInfo } from '../../shared/model/post/post-info.type';
import { MiniProfileCard } from "../../shared/components/mini-profile-card/mini-profile-card";
import { CardPanel } from "../../shared/components/card-panel/card-panel";
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/auth/auth.service';


@Component({
  selector: 'app-flurr-detail',
  standalone: true,
  imports: [CommonModule, Post, MiniProfileCard, CardPanel],
  templateUrl: './flurr-detail.html',
  styleUrls: ['./flurr-detail.css']
})
export class FlurrDetailComponent implements OnInit {
  error = '';

  shortcuts: any[] = [];
  notifications: any[] = [];
  friendsSuggestions: any[] = [];
  posts: any[] = [];

  sortType: string = 'Top';
  sortingPostsMethodOpen: boolean = false;

  flurrId: string | null = null;
  post: PostInfo | null = null;
  currentUser: any = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    this.loadAllData();
    this.flurrId = this.route.snapshot.paramMap.get('id');
    
    if (this.flurrId) {
      await this.loadFlurr(this.flurrId);
    } else {
      this.loading = false;
    }
    
    await this.loadCurrentUser();
  }

  async loadAllData() {
    this.loading = true;
    this.error = '';

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const uid = sessionData.session?.user?.id ?? this.authService.getUserId() ?? null;

      console.log('Home - Loading data for user:', uid);

      if (uid) {
        // ⭐ IMPORTANT: Wait for user data to load completely
        const result = await this.userService.loadFromAuthUserId(uid);
        console.log('Home - User loaded:', result.data);
      } else {
        this.userService.clearUser();
      }

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
          buttonAction: () => this.router.navigate(['/space', s.space_id])
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
          .limit(3);

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
      // FRIENDS SUGGESTIONS
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

  private async getUid() {
    const { data } = await supabase.auth.getSession();
    return data.session?.user?.id ?? null;
  }

  async followUser(userId: string) {
    const uid = await this.getUid();
    if (!uid) return;
    await supabase.from('friends').insert([{ follower_id: uid, followed_id: userId }]);
    this.friendsSuggestions = this.friendsSuggestions.filter(u => u.id !== userId);
  }

  private iconForNotificationType(type: string) {
    if (!type) return 'assets/icons/panel/notification.png';
    if (type.includes('like')) return 'assets/icons/panel/like.png';
    if (type.includes('comment')) return 'assets/icons/panel/comment.png';
    if (type.includes('reply')) return 'assets/icons/panel/comment.png';
    return 'assets/icons/panel/notification.png';
  }

  async loadFlurr(flurrId: string) {
  try {
    this.loading = true;

    // 1) Fetch the single flurr
    const { data: flurrData, error: flurrErr } = await supabase
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
      .eq('flurr_id', flurrId)
      .single();

    if (flurrErr) {
      console.error('Error loading flurr:', flurrErr);
      this.loading = false;
      return;
    }

    console.log(flurrData);

    if (!flurrData) {
      console.log('Flurr not found');
      this.loading = false;
      return;
    }

    // 2) Get likes count for this flurr
    const { data: likesData } = await supabase
      .from('flurr_action')
      .select('flurr_id')
      .eq('flurr_id', flurrId)
      .eq('is_liked', true);

    const likesCount = likesData?.length || 0;

    // 3) Get comments count for this flurr
    const { data: commentsData } = await supabase
      .from('flurr_action')
      .select('flurr_id, comment_id')
      .eq('flurr_id', flurrId)
      .not('comment_id', 'is', null);

    const commentsCount = commentsData?.length || 0;

    // 4) Map the flurr to the post format
    const posterRaw = flurrData.poster;
    const poster = Array.isArray(posterRaw) ? posterRaw[0] : posterRaw;
    console.log(poster);

    const author = poster
      ? {
          id: poster.user_id,
          name: poster.full_name || (poster.email?.split('@')[0] ?? 'Unknown'),
          avatarUrl: poster.avatar_img || './assets/images/hama.png',
          isFollowed: true
        }
      : {
          id: flurrData.poster_id,
          name: 'Unknown',
          avatarUrl: './assets/images/hama.png',
          isFollowed: false
        };

    // Map to match the PostInfo structure expected by Post component
    this.post = {
       id: flurrData.flurr_id,
       content: flurrData.content,
       createdAt: new Date(flurrData.created_at),
       author,
       reactions: { 
         like: likesCount
       },
       commentsCount: commentsCount
    };

    console.log('Loaded flurr:', this.post); // Debug log

    this.loading = false;

  } catch (err) {
    console.error('loadFlurr unexpected error:', err);
    this.loading = false;
  }
}

  async loadCurrentUser() {
    try {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;

      const { data: userData } = await supabase
        .from('users')
        .select('full_name, avatar_img')
        .eq('user_id', data.user.id)
        .single();

      this.currentUser = {
        name: userData?.full_name || 'User',
        avatarUrl: userData?.avatar_img || 'assets/icons/post/avatar-img.avif'
      };
    } catch (err) {
      console.error('loadCurrentUser error:', err);
    }
  }

  goBack() {
    this.router.navigate(['/notifications']);
  }
}