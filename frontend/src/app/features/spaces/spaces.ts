import { Component, ElementRef, OnInit } from '@angular/core';
import { SpacesCard } from '../../shared/components/spaces-card/spaces-card';
import { CardPanel } from '../../shared/components/card-panel/card-panel';
import { Post } from '../../shared/components/post-components/post/post';
import { NgIf, NgFor } from '@angular/common';
import { Router } from '@angular/router';
import { supabase } from '../../core/supabase/supabase.client';

@Component({
  selector: 'app-spaces',
  standalone: true,
  imports: [
    SpacesCard,
    CardPanel,
    Post,
    NgIf,
    NgFor
  ],
  templateUrl: './spaces.html',
  styleUrl: './spaces.css'
})
export class Spaces implements OnInit {

  loading = false;
  error = '';

  joinedSpaces: any[] = [];
  posts: any[] = [];
  notifications: any[] = [];
  friendsSuggestions: any[] = [];

  sortType = 'Top';
  sortingPostsMethodOpen = false;

  constructor(
    private elementRef: ElementRef<HTMLElement>,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAllData();
  }

  // --------------------------------------------------
  // MAIN LOADER (HOME-LIKE)
  // --------------------------------------------------
  async loadAllData() {
    this.loading = true;

    try {
      const { data: session } = await supabase.auth.getSession();
      const uid = session.session?.user?.id;
      if (!uid) return;

      // --------------------------------------------
      // 1) JOINED SPACES
      // --------------------------------------------
      const { data: joined } = await supabase
        .from('join_spaces')
        .select(`
          space_id,
          spaces (
            space_id,
            space_name,
            space_bio,
            avatar_img
          )
        `)
        .eq('user_id', uid);

      this.joinedSpaces = (joined ?? []).map((r: any) => ({
        id: r.spaces.space_id,
        title: r.spaces.space_name,
        imageUrl: r.spaces.avatar_img || './assets/images/hama.png',
        withSubtitle: true,
        subtitle: r.spaces.space_bio ?? 'Space',
        withButton: true,
        buttonText: 'Visit',
        buttonAction: () => this.router.navigate(['/spaces', r.spaces.space_id])
      }));

      const spaceIds = this.joinedSpaces.map(s => s.id);

      // --------------------------------------------
      // 2) SPACE POSTS
      // --------------------------------------------
      if (spaceIds.length > 0) {
        const { data: flurrs } = await supabase
          .from('flurrs')
          .select(`
            flurr_id,
            content,
            created_at,
            space_id,
            poster:poster_id (
              user_id,
              full_name,
              avatar_img
            )
          `)
          //.in('space_id', spaceIds);

        this.posts = (flurrs ?? []).map((r: any) => ({
          id: r.flurr_id,
          content: r.content,
          createdAt: new Date(r.created_at),
          author: {
            id: r.poster.user_id,
            name: r.poster.full_name,
            avatarUrl: r.poster.avatar_img || './assets/images/hama.png',
            isFollowed: true
          },
          reactions: { like: 0 },
          commentsCount: 0,
          userHasLiked: false
        }));
      }

      this.applySorting();

      // --------------------------------------------
      // 3) NOTIFICATIONS
      // --------------------------------------------
      const { data: notifs } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false })
        .limit(10);

      this.notifications = (notifs ?? []).map((n: any) => ({
        id: n.notification_id,
        title: 'Activity',
        imageUrl: './assets/images/hama.png',
        withSubtitle: true,
        subtitle: n.content,
        subtitleOnSameLevel: true,
        withIcon: true,
        iconUrl: this.iconForNotificationType(n.type)
      }));

      // --------------------------------------------
      // 4) SUGGESTED SPACES
      // --------------------------------------------
      const { data: suggestions } = await supabase
        .from('spaces')
        .select('space_id, space_name, avatar_img')
        .not('space_id', 'in', `(${spaceIds.join(',') || 'null'})`)
        .limit(6);

      this.friendsSuggestions = (suggestions ?? []).map((s: any) => ({
        id: s.space_id,
        title: s.space_name,
        imageUrl: s.avatar_img || './assets/images/hama.png',
        withSubtitle: true,
        subtitle: 'Suggested space',
        withButton: true,
        buttonText: 'Join',
        buttonAction: () => this.joinSpace(s.space_id)
      }));

    } finally {
      this.loading = false;
    }
  }

  // --------------------------------------------------
  // JOIN SPACE
  // --------------------------------------------------
  async joinSpace(spaceId: string) {
    const { data } = await supabase.auth.getSession();
    const uid = data.session?.user?.id;
    if (!uid) return;

    await supabase.from('join_spaces').insert({
      user_id: uid,
      space_id: spaceId
    });

    this.loadAllData();
  }

  // --------------------------------------------------
  // SORTING
  // --------------------------------------------------
  applySorting() {
    if (this.sortType === 'Recent') {
      this.posts.sort((a, b) =>
        +new Date(b.createdAt) - +new Date(a.createdAt)
      );
    } else {
      this.posts.sort((a, b) =>
        this.computeScore(b) - this.computeScore(a)
      );
    }
  }

  private computeScore(p: any): number {
    const age = Math.max(1, (Date.now() - +new Date(p.createdAt)) / 3_600_000);
    return (p.reactions.like * 3 + p.commentsCount * 4) - age * 0.5;
  }

  toggleSortingMethodMenu(ev?: Event) {
    ev?.stopPropagation();
    this.sortingPostsMethodOpen = !this.sortingPostsMethodOpen;
  }

  private iconForNotificationType(type: string) {
    if (!type) return 'assets/icons/panel/notification.png';
    if (type.includes('like')) return 'assets/icons/panel/like.png';
    if (type.includes('comment')) return 'assets/icons/panel/comment.png';
    return 'assets/icons/panel/notification.png';
  }
}
