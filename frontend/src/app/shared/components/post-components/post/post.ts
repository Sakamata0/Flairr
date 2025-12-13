// post.ts - FIXED VERSION with proper Supabase integration
import { Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CommentPopUp } from '../comment-pop-up/comment-pop-up';
import { CommentTree, CommentNode } from '../comment-tree/comment-tree';
import { PostInfo } from '../../../model/post/post-info.type';
import { MediaItem } from '../../../model/post/media-item.type';
import { supabase } from '../../../../core/supabase/supabase.client';
import { UserService } from '../../../../core/services/user.service';

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, CommentTree, NgIf],
  templateUrl: './post.html',
  styleUrls: ['./post.css']
})
export class Post implements OnInit, OnDestroy {
  @Input() post: PostInfo | null = null;
  @Input() show: number = 0;
  @Input() currentUser: { name: string; avatarUrl: string | null } | null = null;

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

  private async getCurrentUid(): Promise<string | null> {
    try {
      const u = this.userService.currentUser?.();
      if (u && (u as any).userID) return (u as any).userID;
    } catch (e) { /* ignore */ }

    try {
      const { data } = await supabase.auth.getSession();
      return data.session?.user?.id ?? null;
    } catch (err) {
      console.warn('getCurrentUid error', err);
      return null;
    }
  }

  private normalizeAuthorFromPayload(): void {
    if (!this.post) return;

    const a = (this.post as any).author;
    if (a && (a.name || a.full_name || a.user_id)) {
      if (!a.name && a.full_name) a.name = a.full_name;
      if (!a.avatarUrl && a.avatar_img) a.avatarUrl = a.avatar_img;
      return;
    }

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

    const posterId = (this.post as any).poster_id ?? (this.post as any).posterId;
    if (posterId) {
      (this.post as any).author = {
        id: posterId,
        name: 'Unknown',
        avatarUrl: this.defaultAvatar,
        isFollowed: false
      };
      return;
    }

    (this.post as any).author = (this.post as any).author || { 
      id: null, 
      name: 'Unknown', 
      avatarUrl: this.defaultAvatar, 
      isFollowed: false 
    };
  }

  private async ensureAuthorLoaded(): Promise<void> {
    if (!this.post) return;
    const author = (this.post as any).author;
    if (author && (author.name && author.name !== 'Unknown')) return;

    const posterId = (this.post as any).poster?.user_id ?? 
                     (this.post as any).poster_id ?? 
                     (this.post as any).author?.id;
    if (!posterId) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('user_id, full_name, avatar_img, email')
        .eq('user_id', posterId)
        .single();

      if (error) {
        console.warn('ensureAuthorLoaded error', error);
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

  private async refreshFollowState(): Promise<void> {
    if (!this.post) return;
    const posterId = (this.post as any).poster?.user_id ?? 
                     (this.post as any).poster_id ?? 
                     this.post.author?.id;
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
        console.warn('refreshFollowState error', error);
        return;
      }

      (this.post as any).author = (this.post as any).author || {};
      (this.post as any).author.isFollowed = (data && data.length > 0);
    } catch (err) {
      console.error('refreshFollowState unexpected', err);
    }
  }

  private async refreshLikeState(): Promise<void> {
    if (!this.post) return;
    const uid = await this.getCurrentUid();
    if (!uid) return;
    const flurrId = (this.post as any).id ?? (this.post as any).flurr_id;

    try {
      // FIXED: Use flurr_action table instead of likes
      const { data, error } = await supabase
        .from('flurr_action')
        .select('user_id, flurr_id, is_liked')
        .eq('user_id', uid)
        .eq('flurr_id', flurrId)
        .eq('is_liked', true)
        .limit(1);

      if (error) {
        console.warn('refreshLikeState error', error);
        return;
      }

      (this.post as any).userHasLiked = (data && data.length > 0);
    } catch (err) {
      console.error('refreshLikeState unexpected', err);
    }
  }

  // NEW: Load actual like count from database
  private async loadLikeCount(): Promise<void> {
    if (!this.post) return;
    const flurrId = (this.post as any).id ?? (this.post as any).flurr_id;

    try {
      const { count, error } = await supabase
        .from('flurr_action')
        .select('*', { count: 'exact', head: true })
        .eq('flurr_id', flurrId)
        .eq('is_liked', true);

      if (error) {
        console.warn('loadLikeCount error', error);
        return;
      }

      this.post.reactions = this.post.reactions || {};
      this.post.reactions['like'] = count ?? 0;
    } catch (err) {
      console.error('loadLikeCount unexpected', err);
    }
  }

  // NEW: Load comments from database
  private async loadComments(): Promise<void> {
    if (!this.post) return;
    const flurrId = (this.post as any).id ?? (this.post as any).flurr_id;

    try {
      // Get comment IDs linked to this flurr
      const { data: actions, error: actionsErr } = await supabase
        .from('flurr_action')
        .select('comment_id')
        .eq('flurr_id', flurrId)
        .not('comment_id', 'is', null);

      if (actionsErr) {
        console.warn('loadComments actions error', actionsErr);
        return;
      }

      if (!actions || actions.length === 0) {
        this.post.comments = [];
        this.post.commentsCount = 0;
        return;
      }

      const commentIds = actions.map(a => a.comment_id).filter(Boolean);

      // Get actual comments with user info
      const { data: comments, error: commentsErr } = await supabase
        .from('comments')
        .select(`
          comment_id,
          content,
          suprerior_comment_id,
          created_at,
          user:user_id (
            user_id,
            full_name,
            avatar_img,
            email
          )
        `)
        .in('comment_id', commentIds)
        .order('created_at', { ascending: true });

      if (commentsErr) {
        console.warn('loadComments error', commentsErr);
        return;
      }

      // Build comment tree
      const commentMap = new Map<string, CommentNode>();
      const rootComments: CommentNode[] = [];

      for (const c of comments || []) {
        const user = Array.isArray(c.user) ? c.user[0] : c.user;
        const authorName = user?.full_name ?? (user?.email ? user.email.split('@')[0] : 'Anonymous');
        const authorAvatar = user?.avatar_img || this.defaultAvatar;

        const node = new CommentNode(c.content, {
          name: authorName,
          avatarUrl: authorAvatar
        });
        (node as any).id = c.comment_id;

        commentMap.set(c.comment_id, node);

        if (c.suprerior_comment_id) {
          const parent = commentMap.get(c.suprerior_comment_id);
          if (parent) {
            parent.addAnwser(node);
          } else {
            rootComments.push(node);
          }
        } else {
          rootComments.push(node);
        }
      }

      this.post.comments = rootComments;
      this.post.commentsCount = comments?.length ?? 0;
    } catch (err) {
      console.error('loadComments unexpected', err);
    }
  }

  async ngOnInit(): Promise<void> {
    if (typeof document !== 'undefined') {
      this._outsideClickListener = this.closeMenuOutside.bind(this);
      document.addEventListener('click', this._outsideClickListener);
    }

    this.normalizeAuthorFromPayload();
    await this.ensureAuthorLoaded();
    await this.refreshFollowState();
    await this.refreshLikeState();
    await this.loadLikeCount(); // NEW
    await this.loadComments();  // NEW
  }

  ngOnDestroy(): void {
    if (typeof document !== 'undefined' && this._outsideClickListener) {
      document.removeEventListener('click', this._outsideClickListener);
      this._outsideClickListener = undefined;
    }
  }

  get firstMedia(): MediaItem | undefined {
    return this.post?.media && this.post.media.length > 0 ? this.post.media[0] : undefined;
  }

  get mediaCount(): number {
    return this.post?.media?.length ?? 0;
  }

  openCommentPopUp() {
    const dialogRef = this.dialog.open(CommentPopUp, {
      data: { post: this.post, currentUser: this.currentUser }
    });

    dialogRef.afterClosed().subscribe(async (updatedComments) => {
      if (updatedComments && this.post) {
        this.post.comments = updatedComments;
        this.post.commentsCount = this.post.comments?.length ?? this.post.commentsCount;
      }
      // Reload comments from database to ensure sync
      await this.loadComments();
    });
  }

  // FIXED: Proper like/unlike with flurr_action table
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

    // Optimistic update
    if (userHasLiked) {
      this.post.reactions['like'] = Math.max(currentLikes - 1, 0);
      this.post.userHasLiked = false;
    } else {
      this.post.reactions['like'] = currentLikes + 1;
      this.post.userHasLiked = true;
    }

    try {
      if (userHasLiked) {
        // Unlike: delete the flurr_action record
        const { error } = await supabase
          .from('flurr_action')
          .delete()
          .match({ user_id: uid, flurr_id: flurrId, is_liked: true });

        if (error) {
          console.warn('onReact unlike error', error);
          this.post.reactions['like'] = currentLikes;
          this.post.userHasLiked = true;
        }
      } else {
        // Like: insert or update flurr_action
        const { error } = await supabase
          .from('flurr_action')
          .upsert([{ 
            user_id: uid, 
            flurr_id: flurrId, 
            is_liked: true,
            acted_at: new Date().toISOString()
          }], { 
            onConflict: 'user_id,flurr_id'
          });

        if (error) {
          console.warn('onReact like error', error);
          this.post.reactions['like'] = currentLikes;
          this.post.userHasLiked = false;
        }
      }

      // Reload actual count from database
      await this.loadLikeCount();
    } catch (err) {
      console.error('onReact unexpected', err);
      this.post.reactions['like'] = currentLikes;
      this.post.userHasLiked = userHasLiked;
    }
  }

  async onFollow() {
    if (!this.post) return;
    const posterId = (this.post as any).poster?.user_id ?? 
                     (this.post as any).poster_id ?? 
                     this.post.author?.id;
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
        console.warn('onFollow error', error);
        (this.post as any).author.isFollowed = false;
      }
    } catch (err) {
      console.error('onFollow unexpected', err);
      (this.post as any).author.isFollowed = false;
    }
  }

  async onUnfollow() {
    if (!this.post) return;
    const posterId = (this.post as any).poster?.user_id ?? 
                     (this.post as any).poster_id ?? 
                     this.post.author?.id;
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
        console.warn('onUnfollow error', error);
        (this.post as any).author.isFollowed = true;
      }
    } catch (err) {
      console.error('onUnfollow unexpected', err);
      (this.post as any).author.isFollowed = true;
    }
  }

  // FIXED: Proper comment submission with flurr_action link
  async submitComment() {
    if (!this.newComment.trim() || !this.post) return;
    const uid = await this.getCurrentUid();
    if (!uid) {
      alert('You must be logged in to comment.');
      return;
    }
    const flurrId = (this.post as any).id ?? (this.post as any).flurr_id;

    const commentContent = this.newComment.trim();
    this.newComment = '';
    this.showButton = false;
    this.showComments = true;

    try {
      // 1. Insert comment
      const { data: commentRow, error: insertErr } = await supabase
        .from('comments')
        .insert([{ 
          content: commentContent, 
          user_id: uid,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (insertErr) {
        console.warn('submitComment error', insertErr);
        return;
      }

      const commentId = commentRow.comment_id;

      // 2. Link comment to flurr via flurr_action
      const { error: linkErr } = await supabase
        .from('flurr_action')
        .insert([{ 
          user_id: uid, 
          flurr_id: flurrId, 
          comment_id: commentId,
          is_liked: false,
          acted_at: new Date().toISOString()
        }]);

      if (linkErr) {
        console.warn('submitComment link error', linkErr);
      }

      // 3. Reload comments from database
      await this.loadComments();

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
    const confirmed = confirm(`Block user ${this.post.author?.name ?? 'user'}?`);
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