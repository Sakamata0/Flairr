// src/app/features/home/home.ts
import { Component, ElementRef, OnInit } from '@angular/core';
import { FlurrCreationCard } from '../../shared/components/flurr-creation-card/flurr-creation-card';
import { CardPanel } from '../../shared/components/card-panel/card-panel';
import { MiniProfileCard } from '../../shared/components/mini-profile-card/mini-profile-card';
import { Post } from '../../shared/components/post-components/post/post';
import { NgIf, NgForOf, AsyncPipe, NgFor } from '@angular/common';
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
    NgForOf,
    NgFor
  ],
  templateUrl: './home.html',
  styleUrl: './home.css'
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

    supabase.auth.onAuthStateChange((_event, session) => {
      this.loadAllData(); 
    });
  }

  async loadAllData() {
    this.error = '';

    try {

      const { data: sessionData } = await supabase.auth.getSession();
      const uid = sessionData.session?.user?.id ?? this.authService.getUserId();


      if (uid) {
        await this.userService.loadFromAuthUserId(uid);
      } else {
        this.userService.clearUser();
      }


      
      const { data: flurrs, error: flurrsErr } = await supabase
        .from('flurrs')
        .select('flurr_id, type, content, date_publish, poster_id, created_at, updated_at, poster:poster_id(user_id, full_name, avatar_img)')
        .order('created_at', { ascending: false })
        .limit(20);

      if (flurrsErr) {
        console.warn('flurrsErr', flurrsErr);
      } else if (flurrs) {

        this.posts = flurrs.map((r: any) => ({
          id: r.flurr_id,
          type: r.type,
          content: r.content,
          created_at: r.created_at,
          poster: r.poster ?? { user_id: r.poster_id, full_name: 'Unknown', avatar_img: '' }
        }));
      }


      const { data: spaces, error: spacesErr } = await supabase
        .from('spaces')
        .select('space_id, space_name, space_bio, avatar_img, cover_img, space_owner')
        .order('created_at', { ascending: false })
        .limit(12);

      if (spacesErr) {
        console.warn('spacesErr', spacesErr);
      } else if (spaces) {
        this.shortcuts = spaces.map((s: any) => ({
          id: s.space_id,
          title: s.space_name,
          imageUrl: s.avatar_img || './assets/images/hama.png',
          withSubtitle: !!s.space_bio,
          subtitle: s.space_bio ?? '',
          withButton: true,
          buttonText: 'Visit',
          buttonAction: () => { this.router.navigate(['/space', s.space_id]); }
        }));
      }


      if (uid) {
        const { data: notifs, error: notifsErr } = await supabase
          .from('notifications')
          .select('notification_id, type, content, actor_id, flurr_id, created_at')
          .eq('user_id', uid)
          .order('created_at', { ascending: false })
          .limit(20);

        if (notifsErr) {
          console.warn('notifsErr', notifsErr);
        } else if (notifs) {

          this.notifications = await Promise.all(notifs.map(async (n: any) => {

            let actor = { full_name: 'Someone', avatar_img: './assets/images/hama.png' };
            if (n.actor_id) {
              const { data: actorRow } = await supabase.from('users').select('user_id, full_name, avatar_img').eq('user_id', n.actor_id).single();
              if (actorRow) actor = { full_name: actorRow.full_name, avatar_img: actorRow.avatar_img || './assets/images/hama.png' };
            }
            return {
              id: n.notification_id,
              title: actor.full_name,
              imageUrl: actor.avatar_img,
              withSubtitle: true,
              subtitle: n.content,
              subtitleOnSameLevel: true,
              withIcon: true,
              iconUrl: this.iconForNotificationType(n.type),
              withButton: false
            };
          }));
        }
      } else {
        this.notifications = [];
      }


      const { data: users, error: usersErr } = await supabase
        .from('users')
        .select('user_id, full_name, avatar_img')
        .neq('user_id', uid ?? '')
        .limit(6);

      if (usersErr) {
        console.warn('usersErr', usersErr);
      } else if (users) {
        this.friendsSuggestions = users.map((u: any) => ({
          id: u.user_id,
          title: u.full_name,
          imageUrl: u.avatar_img || './assets/images/hama.png',
          withSubtitle: true,
          subtitle: 'Suggested user',
          withButton: true,
          buttonText: 'Follow',
          buttonAction: () => { this.followUser(u.user_id); }
        }));
      }

    } catch (e: any) {
      console.error('loadAllData error', e);
      this.error = e?.message ?? 'Error loading data';
    } finally {
      this.loading = false;
    }
  }

  private iconForNotificationType(type: string) {
    if (!type) return 'assets/icons/panel/notification.png';
    if (type.includes('like')) return 'assets/icons/panel/like.png';
    if (type.includes('comment')) return 'assets/icons/panel/comment.png';
    return 'assets/icons/panel/notification.png';
  }

  async followUser(userId: string) {
    try {
      const { data, error } = await supabase.from('friends').insert([{ follower_id: (await this.getUid()) ?? '', followed_id: userId }]);
      if (error) {
        console.warn('follow error', error);
      } else {
        console.log('followed', data);
        // optionally update UI
        this.friendsSuggestions = this.friendsSuggestions.filter(u => u.id !== userId);
      }
    } catch (err) {
      console.error(err);
    }
  }


  private async getUid(): Promise<string | null> {
    const { data } = await supabase.auth.getSession();
    return data.session?.user?.id ?? this.authService.getUserId();
  }

  toggleSortingMethodMenu(ev?: Event) {
    ev?.stopPropagation();
    this.sortingPostsMethodOpen = !this.sortingPostsMethodOpen;
    const wrap = this.elementRef.nativeElement.querySelector('.sorting-posts-method-wrap');
    if (wrap) {
      wrap.classList.toggle('sorting-posts-method-open', this.sortingPostsMethodOpen);
    }
  }
}
