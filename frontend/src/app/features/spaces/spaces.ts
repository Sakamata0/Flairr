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
  imports: [SpacesCard, CardPanel, Post, NgIf, NgFor],
  templateUrl: './spaces.html',
  styleUrls: ['./spaces.css']
})
export class Spaces implements OnInit {
  loading = true;
  error = '';

  joinedSpaces: any[] = [];
  posts: any[] = [];
  notifications: any[] = [];
  friendsSuggestions: any[] = [];

  sortType = 'Top';
  sortingPostsMethodOpen = false;
  activeTab: 'feed' | 'discover' | 'mySpaces' = 'feed';

  constructor(
    private elementRef: ElementRef<HTMLElement>,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAllData();
  }

  setActiveTab(tab: 'feed' | 'discover' | 'mySpaces') {
    this.activeTab = tab;
    this.loadAllData();
  }

  async loadAllData() {
    this.loading = true;
    try {
      const { data: session } = await supabase.auth.getSession();
      const uid = session.session?.user?.id;
      if (!uid) return;

      // --- 1) JOINED SPACES ---
      const { data: joined } = await supabase
        .from('join_spaces')
        .select(`
          space_id,
          spaces (
            space_id,
            space_name,
            space_bio,
            avatar_img,
            space_owner
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

      const joinedSpaceIds = this.joinedSpaces.map(s => s.id);

      // --- 2) FETCH POSTS BASED ON ACTIVE TAB ---
      if (this.activeTab === 'feed') {
        // Feed = all posts from joined + owned spaces
        const { data: ownedSpaces } = await supabase
          .from('spaces')
          .select('space_id')
          .eq('space_owner', uid);

  const ownedSpaceIds: string[] = ownedSpaces?.map((os: any) => os.space_id) || [];
        const allSpaceIds = Array.from(new Set([...joinedSpaceIds, ...ownedSpaceIds]));

        if (allSpaceIds.length > 0) {
          const { data: flurrs } = await supabase
            .from('flurrs')
            .select(`
              flurr_id,
              content,
              created_at,
              date_publish,
              space_id,
              poster:poster_id (
                user_id,
                full_name,
                avatar_img
              )
            `)
            .eq('type', 'space')
            .in('space_id', allSpaceIds)
            .order('created_at', { ascending: false });

          this.posts = (flurrs ?? []).map((r: any) => ({
            id: r.flurr_id,
            content: r.content,
            createdAt: new Date(r.created_at ?? r.date_publish),
            author: {
              id: r.poster?.user_id,
              name: r.poster?.full_name,
              avatarUrl: r.poster?.avatar_img || './assets/images/hama.png',
              isFollowed: true
            },
            reactions: { like: 0 },
            commentsCount: 0,
            userHasLiked: false,
            spaceId: r.space_id
          }));
        } else this.posts = [];

      } else if (this.activeTab === 'discover') {
        // Discover = flurrs from spaces NOT joined AND not owned
        const { data: suggestions } = await supabase
          .from('spaces')
          .select('space_id')
          .not('space_id', 'in', `(${joinedSpaceIds.join(',') || 'null'})`)
          .not('space_owner', 'eq', uid)
          .limit(6);

        const discoverSpaceIds = suggestions?.map((s: any) => s.space_id) || [];
        if (discoverSpaceIds.length > 0) {
          const { data: flurrs } = await supabase
            .from('flurrs')
            .select(`
              flurr_id,
              content,
              created_at,
              date_publish,
              space_id,
              poster:poster_id (
                user_id,
                full_name,
                avatar_img
              )
            `)
            .eq('type', 'space')
            .in('space_id', discoverSpaceIds)
            .order('created_at', { ascending: false });

          this.posts = (flurrs ?? []).map((r: any) => ({
            id: r.flurr_id,
            content: r.content,
            createdAt: new Date(r.created_at ?? r.date_publish),
            author: {
              id: r.poster?.user_id,
              name: r.poster?.full_name,
              avatarUrl: r.poster?.avatar_img || './assets/images/hama.png',
              isFollowed: true
            },
            reactions: { like: 0 },
            commentsCount: 0,
            userHasLiked: false,
            spaceId: r.space_id
          }));
        } else this.posts = [];

      } else if (this.activeTab === 'mySpaces') {
        // My Spaces = flurrs from spaces I own
        const { data: ownedSpaces } = await supabase
          .from('spaces')
          .select('space_id')
          .eq('space_owner', uid);

        const mySpaceIds = ownedSpaces?.map((os: any) => os.space_id) || [];
        if (mySpaceIds.length > 0) {
          const { data: flurrs } = await supabase
            .from('flurrs')
            .select(`
              flurr_id,
              content,
              created_at,
              date_publish,
              space_id,
              poster:poster_id (
                user_id,
                full_name,
                avatar_img
              )
            `)
            .eq('type', 'space')
            .in('space_id', mySpaceIds)
            .order('created_at', { ascending: false });

          this.posts = (flurrs ?? []).map((r: any) => ({
            id: r.flurr_id,
            content: r.content,
            createdAt: new Date(r.created_at ?? r.date_publish),
            author: {
              id: r.poster?.user_id,
              name: r.poster?.full_name,
              avatarUrl: r.poster?.avatar_img || './assets/images/hama.png',
              isFollowed: true
            },
            reactions: { like: 0 },
            commentsCount: 0,
            userHasLiked: false,
            spaceId: r.space_id
          }));
        } else this.posts = [];
      }

      this.applySorting();

      // --- 3) NOTIFICATIONS ---
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

      // --- 4) SUGGESTED SPACES ---
      const { data: suggestions2 } = await supabase
        .from('spaces')
        .select('space_id, space_name, avatar_img')
        .not('space_id', 'in', `(${joinedSpaceIds.join(',') || 'null'})`)
        .not('space_owner', 'eq', uid)
        .limit(6);

      this.friendsSuggestions = (suggestions2 ?? []).map((s: any) => ({
        id: s.space_id,
        title: s.space_name,
        imageUrl: s.avatar_img || './assets/images/hama.png',
        withSubtitle: true,
        subtitle: 'Suggested space',
        withButton: true,
        buttonText: 'Visit',
        buttonAction: () => this.router.navigate(['/spaces', s.space_id])
      }));

    } finally {
      this.loading = false;
    }
  }

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

  applySorting() {
    if (this.sortType === 'Recent') {
      this.posts.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    } else {
      this.posts.sort((a, b) => this.computeScore(b) - this.computeScore(a));
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
    if (type.includes('reply')) return 'assets/icons/panel/comment.png';
    return 'assets/icons/panel/notification.png';
  }
}
