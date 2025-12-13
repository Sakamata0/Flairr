import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Post } from '../../shared/components/post-components/post/post';
import { supabase } from '../../core/supabase/supabase.client';
import { PostInfo } from '../../shared/model/post/post-info.type';


@Component({
  selector: 'app-flurr-detail',
  standalone: true,
  imports: [CommonModule, Post],
  templateUrl: './flurr-detail.html',
  styleUrls: ['./flurr-detail.css']
})
export class FlurrDetailComponent implements OnInit {
  flurrId: string | null = null;
  post!: PostInfo;
  currentUser: any = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  async ngOnInit() {
    this.flurrId = this.route.snapshot.paramMap.get('id');
    
    if (this.flurrId) {
      await this.loadFlurr(this.flurrId);
    } else {
      this.loading = false;
    }
    
    await this.loadCurrentUser();
  }

  async loadFlurr(flurrId: string) {
    try {
      const { data, error } = await supabase
        .from('flurrs')
        .select(`
          flurr_id,
          type,
          content,
          date_publish,
          created_at,
          poster:poster_id (
            user_id,
            full_name,
            avatar_img,
            email
          )
        `)
        .eq('flurr_id', flurrId)
        .single();

      if (error) {
        console.error('loadFlurr error:', error);
        this.loading = false;
        return;
      }
      const posterRaw = data.poster;
      const poster = Array.isArray(posterRaw) ? posterRaw[0]: posterRaw;
      const author = poster
      ? {
          id: poster.user_id,
          name: poster.full_name || (poster.email?.split('@')[0] ?? 'Unknown'),
          avatarUrl: poster.avatar_img || './assets/images/hama.png',
          isFollowed: true // if it's in feed, we already follow them
        }
      : {
          id: data.poster,
          name: 'Unknown',
          avatarUrl: './assets/images/hama.png',
          isFollowed: false
        };
      this.post = {
        ...data,
        id: data.flurr_id,
        author,
        createdAt: new Date(data.created_at),
        reactions: data.reactions
      }
      
      data.map((r: any) => {
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

      

      this.post = {
        id: data.flurr_id,
        content: data.content,
        createdAt: new Date(data.date_publish || data.created_at),
        author: {
          id: data.poster[0].user_id,
          name: data.poster[0]?.full_name || data.poster[0]?.email?.split('@')[0] || 'Unknown',
          avatarUrl: data.poster[0]?.avatar_img || 'assets/icons/post/avatar-img.avif'
        },
        reactions: {},
        commentsCount: 0,
        viewsCount: 0
      };
      
      

      // Fetch like count
      const { count: likeCount } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('flurr_id', flurrId);

      this.post.reactions.like = likeCount || 0;

      // Fetch comment count
      const { count: commentCount } = await supabase
        .from('comment_actions')
        .select('*', { count: 'exact', head: true })
        .eq('flurr_id', flurrId);

      this.post.commentsCount = commentCount || 0;

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