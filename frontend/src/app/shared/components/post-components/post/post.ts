import { Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CommentPopUp } from '../comment-pop-up/comment-pop-up';
import { CommentTree, CommentNode } from '../comment-tree/comment-tree';
import { PostInfo } from '../../../model/post/post-info.type';
import { MediaItem } from '../../../model/post/media-item.type';
import { supabase } from '../../../../core/supabase/supabase.client'; // adjust path if needed
import { UserService } from '../../../../core/services/user.service'; // adjust path if needed
import { GalleriaModule } from 'primeng/galleria';

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, CommentTree, NgIf, GalleriaModule],
  templateUrl: './post.html',
  styleUrls: ['./post.css']
})
export class Post implements OnInit, OnDestroy {
  responsiveOptions = [
    { breakpoint: '1024px', numVisible: 5 },
    { breakpoint: '768px', numVisible: 3 },
    { breakpoint: '560px', numVisible: 1 }
  ];

  @Input() post: PostInfo | null = {
    id: 'p1',
    title: 'Flairr Journey: #Building_my_first_full-stack_app',
    author: { id: 'u1', name: 'Catharina', avatarUrl: 'assets/icons/post/avatar2-img.avif', title: '', isFollowed: false },
    content: "🚀 Just finished connecting my Angular frontend #hhahaa to my Node.js API!",
    media: [
      { url: 'assets/post-examples/hero_slide1.jpg', type: 'image', filename: 'screenshot.png' },
      { url: 'assets/post-examples/hero_slide2.jpg', type: 'image', filename: 'screenshot.png' }, 
      { url: 'assets/post-examples/killbill.mp4', type: 'video', filename: 'screenshot.png' },
      { url: 'assets/post-examples/hero_slide3.jpg', type: 'image', filename: 'screenshot.png' },    
    ],
    reactions: { like: 232 },
    commentsCount: 120,
    viewsCount: 1500,
    createdAt: new Date()
  };
  @Input() show: number = 0;
  @Input() currentUser: { name: string; avatarUrl: string | null } | null = {
    name: 'Mohamed Houcine',
    avatarUrl: 'assets/icons/post/avatar-img.avif'
  };

  defaultAvatar = 'assets/icons/post/avatar-img.avif';
  CommentPopUp = CommentPopUp;

  showComments = false;
  showMenu = false;
  newComment = '';
  showButton = false;
  private _outsideClickListener?: (ev: MouseEvent) => void;

  constructor(
    private host: ElementRef<HTMLElement>,
    private dialog: MatDialog,
    private userService: UserService
  ) {}

  // fetch helper that will load flurr media files
  private async loadPostMedia(): Promise<void> {
    if (!this.post) return;

    try {
      const flurrId = this.post.id ?? (this.post as any).flurr_id;
      const { data: files, error } = await supabase
        .from('flurr_files')
        .select('link_url, type')
        .eq('flurr_id', flurrId);

      if (error) {
        console.warn('Failed to fetch flurr_files:', error);
        return;
      }

      if (files && files.length > 0) {
        // map to your MediaItem shape
        this.post.media = files.map((f: any) => ({
          url: f.link_url,
          type: f.type,
          filename: f.link_url.split('/').pop() || ''
        }));
      }
    } catch (err) {
      console.error('Unexpected error fetching media:', err);
    }
  }


  // ----------------------------
  // Utility helpers
  // ----------------------------
  private async getCurrentUid(): Promise<string | null> {
    try {
      const u = this.userService.currentUser?.();
      if (u && (u as any).userID) return (u as any).userID;
    } catch (e) { /* ignore */ }

    try {
      const { data } = await supabase.auth.getSession();
      return data.session?.user?.id ?? null;
    } catch (err) {
      console.warn('getCurrentUid supabase.auth.getSession error', err);
      return null;
    }
  }

  /**
   * Normalize incoming post payload so the template can always use `post.author.name`
   * Works for shapes:
   *  - post.author.{name, avatarUrl}
   *  - post.poster (object returned by select join) { user_id, full_name, avatar_img }
   *  - post.poster_id (scalar)
   */
  private normalizeAuthorFromPayload(): void {
    if (!this.post) return;

    // if author already present with a name, nothing to do
    const a = (this.post as any).author;
    if (a && (a.name || a.full_name || a.user_id)) {
      // if there is a full_name, map it to name for template convenience
      if (!a.name && a.full_name) a.name = a.full_name;
      if (!a.avatarUrl && a.avatar_img) a.avatarUrl = a.avatar_img;
      return;
    }

    // 1) If backend returned nested poster object (poster: { user_id, full_name, avatar_img })
    const posterObj = (this.post as any).poster;
    if (posterObj && (posterObj.user_id || posterObj.full_name)) {
      const name = posterObj.full_name ?? (posterObj.email ? posterObj.email.split('@')[0] : 'Unknown');
      (this.post as any).author = {
        id: posterObj.user_id ?? posterObj.id,
        name,
        avatarUrl: posterObj.avatar_img || posterObj.avatarUrl || this.defaultAvatar,
        isFollowed: posterObj.isFollowed ?? false
      };
      return;
    }

    // 2) If backend returned poster_id scalar
    const posterId = (this.post as any).poster_id ?? (this.post as any).posterId;
    if (posterId) {
      (this.post as any).author = {
        id: posterId,
        name: 'Unknown', // will be filled by ensureAuthorLoaded()
        avatarUrl: this.defaultAvatar,
        isFollowed: false
      };
      return;
    }

    // 3) fallback: ensure author object exists
    (this.post as any).author = (this.post as any).author || { id: null, name: 'Unknown', avatarUrl: this.defaultAvatar, isFollowed: false };
  }

  // If the author object is missing details, fetch from users table
  private async ensureAuthorLoaded(): Promise<void> {
    if (!this.post) return;
    const author = (this.post as any).author;
    if (author && (author.name && author.name !== 'Unknown')) return;

    const posterId = (this.post as any).poster?.user_id ?? (this.post as any).poster_id ?? (this.post as any).author?.id;
    if (!posterId) return;

    try {
      const { data, error } = await supabase.from('users').select('user_id, full_name, avatar_img, email').eq('user_id', posterId).single();
      if (error) {
        console.warn('ensureAuthorLoaded: users.select error', error);
        return;
      }
      const name = data.full_name ?? (data.email ? data.email.split('@')[0] : 'Unknown');
      (this.post as any).author = {
        id: data.user_id,
        name,
        avatarUrl: data.avatar_img || this.defaultAvatar,
        isFollowed: false
      };
    } catch (err) {
      console.error('ensureAuthorLoaded unexpected', err);
    }
  }

  // check if the current user follows the post author
  private async refreshFollowState(): Promise<void> {
    if (!this.post) return;
    const posterId = (this.post as any).poster?.user_id ?? (this.post as any).poster_id ?? this.post.author?.id;
    if (!posterId) return;
    const uid = await this.getCurrentUid();
    if (!uid) return;

    try {
      const { data, error } = await supabase
        .from('friends')
        .select('follower_id, followed_id')
        .eq('follower_id', uid)
        .eq('followed_id', posterId)
        .limit(1);

      if (error) {
        console.warn('refreshFollowState friends select error', error);
        return;
      }

      (this.post as any).author = (this.post as any).author || {};
      (this.post as any).author.isFollowed = (data && data.length > 0);
    } catch (err) {
      console.error('refreshFollowState unexpected', err);
    }
  }

  // check if the current user liked the post
  private async refreshLikeState(): Promise<void> {
    if (!this.post) return;
    const uid = await this.getCurrentUid();
    if (!uid) return;
    const flurrId = (this.post as any).id ?? (this.post as any).flurr_id;

    try {
      const { data, error } = await supabase
        .from('likes')
        .select('user_id, flurr_id')
        .eq('user_id', uid)
        .eq('flurr_id', flurrId)
        .limit(1);

      if (error) {
        console.warn('refreshLikeState likes select error', error);
        return;
      }

      (this.post as any).userHasLiked = (data && data.length > 0);
    } catch (err) {
      console.error('refreshLikeState unexpected', err);
    }
  }

  // ----------------------------
  // Lifecycle
  // ----------------------------
  async ngOnInit(): Promise<void> {
    if (typeof document !== 'undefined') {
      this._outsideClickListener = this.closeMenuOutside.bind(this);
      document.addEventListener('click', this._outsideClickListener);
    }

    // normalize incoming payload so template can rely on post.author.name
    this.normalizeAuthorFromPayload();

    // then try to fill missing author details and refresh states
    await this.ensureAuthorLoaded();
    await this.refreshFollowState();
    await this.refreshLikeState();

    // Load attached media
    await this.loadPostMedia();
  }

  ngOnDestroy(): void {
    if (typeof document !== 'undefined' && this._outsideClickListener) {
      document.removeEventListener('click', this._outsideClickListener);
      this._outsideClickListener = undefined;
    }
  }

  // media helpers
  get firstMedia(): MediaItem | undefined {
    return this.post?.media && this.post.media.length > 0 ? this.post.media[0] : undefined;
  }

  get mediaCount(): number {
    return this.post?.media?.length ?? 0;
  }

  // Open comment popup (uses MatDialog)
  openCommentPopUp() {
    const dialogRef = this.dialog.open(CommentPopUp, {
      data: { post: this.post, currentUser: this.currentUser }
    });

    dialogRef.afterClosed().subscribe((updatedComments) => {
      if (updatedComments && this.post) {
        this.post.comments = updatedComments;
        this.post.commentsCount = this.post.comments?.length ?? this.post.commentsCount;
      }
    });
  }

  // Like/unlike with optimistic UI and Supabase writes
  async onReact(type: string) {
    if (!this.post) return;
    if (type !== 'like') return;

    const flurrId = (this.post as any).id ?? (this.post as any).flurr_id;
    const uid = await this.getCurrentUid();
    if (!uid) {
      alert('You must be logged in to like posts.');
      return;
    }

    this.post.reactions = this.post.reactions || {};
    const currentLikes = this.post.reactions['like'] ?? 0;
    const userHasLiked = !!this.post.userHasLiked;

    // optimistic update
    if (userHasLiked) {
      this.post.reactions['like'] = Math.max(currentLikes - 1, 0);
      this.post.userHasLiked = false;
    } else {
      this.post.reactions['like'] = currentLikes + 1;
      this.post.userHasLiked = true;
    }

    try {
      if (userHasLiked) {
        const { error } = await supabase
          .from('likes')
          .delete()
          .match({ user_id: uid, flurr_id: flurrId });

        if (error) {
          console.warn('onReact unlike error', error);
          this.post.reactions['like'] = currentLikes;
          this.post.userHasLiked = true;
        }
      } else {
        const { error } = await supabase
          .from('likes')
          .insert([{ user_id: uid, flurr_id: flurrId }]);

        if (error) {
          console.warn('onReact like error', error);
          this.post.reactions['like'] = currentLikes;
          this.post.userHasLiked = false;
        }
      }
    } catch (err) {
      console.error('onReact unexpected', err);
      this.post.reactions['like'] = currentLikes;
      this.post.userHasLiked = userHasLiked;
    }
  }

  // Follow author (writes to friends)
  async onFollow() {
    if (!this.post) return;
    const posterId = (this.post as any).poster?.user_id ?? (this.post as any).poster_id ?? this.post.author?.id;
    const uid = await this.getCurrentUid();
    if (!uid) {
      alert('You must be logged in to follow users.');
      return;
    }
    if (!posterId) return;

    (this.post as any).author = (this.post as any).author || {};
    (this.post as any).author.isFollowed = true;

    try {
      const { error } = await supabase
        .from('friends')
        .insert([{ follower_id: uid, followed_id: posterId }]);
      if (error) {
        console.warn('onFollow insert error', error);
        (this.post as any).author.isFollowed = false;
      }
    } catch (err) {
      console.error('onFollow unexpected', err);
      (this.post as any).author.isFollowed = false;
    }
  }

  async onUnfollow() {
    if (!this.post) return;
    const posterId = (this.post as any).poster?.user_id ?? (this.post as any).poster_id ?? this.post.author?.id;
    const uid = await this.getCurrentUid();
    if (!uid) {
      alert('You must be logged in to unfollow users.');
      return;
    }
    if (!posterId) return;

    (this.post as any).author = (this.post as any).author || {};
    (this.post as any).author.isFollowed = false;

    try {
      const { error } = await supabase
        .from('friends')
        .delete()
        .match({ follower_id: uid, followed_id: posterId });
      if (error) {
        console.warn('onUnfollow delete error', error);
        (this.post as any).author.isFollowed = true;
      }
    } catch (err) {
      console.error('onUnfollow unexpected', err);
      (this.post as any).author.isFollowed = true;
    }
  }

  async submitComment() {
    if (!this.newComment.trim() || !this.post) return;
    const uid = await this.getCurrentUid();
    if (!uid) {
      alert('You must be logged in to comment.');
      return;
    }
    const flurrId = (this.post as any).id ?? (this.post as any).flurr_id;

    const newLocalComment = new CommentNode(this.newComment.trim(), {
      name: this.currentUser?.name ?? 'Me',
      avatarUrl: this.currentUser?.avatarUrl ?? this.defaultAvatar
    });
    if (!this.post.comments) this.post.comments = [];
    this.post.comments.push(newLocalComment);
    this.post.commentsCount = (this.post.commentsCount ?? 0) + 1;

    const commentContent = this.newComment.trim();
    this.newComment = '';
    this.showButton = false;
    this.showComments = true;

    try {
      const { data: commentRow, error: insertErr } = await supabase
        .from('comments')
        .insert([{ content: commentContent, user_id: uid }])
        .select()
        .single();

      if (insertErr) {
        console.warn('submitComment insert comment error', insertErr);
        return;
      }

      const commentId = commentRow.comment_id;

      const { error: linkErr } = await supabase
        .from('comment_actions')
        .insert([{ user_id: uid, flurr_id: flurrId, comment_id: commentId, action_type: 'comment' }]);

      if (linkErr) {
        console.warn('submitComment link comment_actions error', linkErr);
      }

      (this.post.comments[this.post.comments.length - 1] as any).id = commentId;
    } catch (err) {
      console.error('submitComment unexpected', err);
    }
  }

  hidePost() {
    if (!this.post) return;
    this.post.isHidden = true;
    this.showMenu = false;
  }

  restorePost() {
    if (!this.post) return;
    this.post.isHidden = false;
  }

  blockUser() {
    if (!this.post) return;
    const confirmed = confirm(`Block user ${this.post.author?.name ?? 'user'}? You won't see their posts anymore.`);
    if (!confirmed) {
      this.showMenu = false;
      return;
    }
    this.post.author.isBlocked = true;
    this.post.isHidden = true;
    this.showMenu = false;
  }

  reportPost() {
    if (!this.post) return;
    const reason = prompt('Please enter a short reason for reporting this post (optional):');
    this.post.isReported = true;
    this.showMenu = false;
    alert('Thank you — the post has been reported.');
  }

  toggleComments() { this.showComments = !this.showComments; }
  toggleButton() { this.showButton = this.newComment.trim() !== ''; }
  onCommentBlur() { if (!this.newComment.trim()) this.showComments = false; }

  closeMenuOutside(event: MouseEvent) {
    if (!this.showMenu) return;
    const hostEl = this.host.nativeElement;
    if (!hostEl.contains(event.target as Node)) {
      this.showMenu = false;
    }
  }

 
  formatHashtags(text?: string): string {
    if (!text) return '';

    const escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    return escaped.replace(/(#[\w_-]+)/g, '<a class="hashtag" href="#">$1</a>');
  }

  toggleMenu(event?: MouseEvent) {
    if (event) event.stopPropagation();
    this.showMenu = !this.showMenu;
  }
}
