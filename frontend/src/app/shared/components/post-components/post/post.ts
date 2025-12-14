// post.ts - COMPREHENSIVE FIX with multiple strategies
import { Component, ElementRef, Input, OnDestroy, OnInit, EventEmitter, Output, ChangeDetectorRef } from '@angular/core';
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
      { url: 'assets/post-tests/hero_slide1.jpg', type: 'image', filename: 'screenshot.png' },
      { url: 'assets/post-tests/hero_slide2.jpg', type: 'image', filename: 'screenshot.png' }, 
      { url: 'assets/post-tests/hero_slide3.jpg', type: 'image', filename: 'screenshot.png' },    
    ],
    reactions: { like: 232 },
    commentsCount: 120,
    viewsCount: 1500,
    createdAt: new Date()
  };
  @Input() show: number = 0;
  @Input() currentUser: { name: string; avatarUrl: string | null } | null = null;
  @Output() postChanged = new EventEmitter<void>();

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
    private userService: UserService,
    private cdr: ChangeDetectorRef
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
      const { data, error } = await supabase
        .from('flurr_action')
        .select('is_liked')
        .eq('user_id', uid)
        .eq('flurr_id', flurrId)
        .eq('is_liked', true)
        .is('comment_id', null)
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

  private async loadLikeCount(): Promise<void> {
    if (!this.post) return;
    const flurrId = (this.post as any).id ?? (this.post as any).flurr_id;

    try {
      const { count, error } = await supabase
        .from('flurr_action')
        .select('*', { count: 'exact', head: true })
        .eq('flurr_id', flurrId)
        .eq('is_liked', true)
        .is('comment_id', null);

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

 // Replace your loadComments method in post.ts with this version
// This includes user_id so reply notifications know who to notify

async loadComments(): Promise<void> {
  if (!this.post) return;
  const flurrId = (this.post as any).id ?? (this.post as any).flurr_id;

  console.log('=== loadComments START ===');
  console.log('Post ID:', flurrId);

  try {
    // Step 1: Get root comment IDs from flurr_action
    const { data: actions, error: actionsErr } = await supabase
      .from('flurr_action')
      .select('comment_id')
      .eq('flurr_id', flurrId)
      .not('comment_id', 'is', null);

    if (actionsErr) {
      console.warn('loadComments actions error', actionsErr);
      return;
    }

    console.log('flurr_action records found:', actions?.length || 0);

    if (!actions || actions.length === 0) {
      console.log('No comments linked to this post');
      this.post.comments = [];
      this.post.commentsCount = 0;
      return;
    }

    const rootCommentIds = actions.map(a => a.comment_id).filter(Boolean);
    console.log('Root comment IDs:', rootCommentIds);

    // Step 2: Get ALL comments (root + their replies) WITH user_id
    const { data: allComments, error: commentsErr } = await supabase
      .from('comments')
      .select(`
        comment_id,
        content,
        user_id,
        suprerior_comment_id,
        created_at,
        user:user_id (
          user_id,
          full_name,
          avatar_img,
          email
        )
      `)
      .order('created_at', { ascending: true });

    if (commentsErr) {
      console.warn('loadComments error', commentsErr);
      return;
    }

    console.log('Total comments in database:', allComments?.length || 0);

    if (!allComments) {
      this.post.comments = [];
      this.post.commentsCount = 0;
      return;
    }

    // Step 3: Build comment tree
    const commentMap = new Map<string, CommentNode>();
    const rootComments: CommentNode[] = [];
    let totalCommentCount = 0;

    // Create all nodes first
    for (const c of allComments) {
      const user = Array.isArray(c.user) ? c.user[0] : c.user;
      const authorName = user?.full_name ?? (user?.email ? user.email.split('@')[0] : 'Anonymous');
      const authorAvatar = user?.avatar_img || this.defaultAvatar;

      const node = new CommentNode(c.content, {
        name: authorName,
        avatarUrl: authorAvatar
      });
      (node as any).id = c.comment_id;
      (node as any).userId = c.user_id; // ✅ Store user_id for reply notifications
      (node.author as any).userId = c.user_id; // ✅ Also store in author object

      commentMap.set(c.comment_id, node);
    }

    // Build tree structure and count ALL comments (root + replies)
    for (const c of allComments) {
      const node = commentMap.get(c.comment_id);
      if (!node) continue;

      // Check if this is a root comment
      if (rootCommentIds.includes(c.comment_id)) {
        rootComments.push(node);
        totalCommentCount++;
        console.log('  → Root comment:', c.comment_id.substring(0, 8));
      } else if (c.suprerior_comment_id) {
        // This is a reply
        const parent = commentMap.get(c.suprerior_comment_id);
        if (parent) {
          parent.addAnwser(node);
          totalCommentCount++;
          console.log('  → Reply:', c.comment_id.substring(0, 8), 'to', c.suprerior_comment_id.substring(0, 8));
        }
      }
    }

    console.log('Built tree:', rootComments.length, 'root,', totalCommentCount, 'total');
    
    // CRITICAL: Create NEW array reference to trigger Angular change detection
    this.post.comments = [...rootComments];
    this.post.commentsCount = totalCommentCount;
    
    // Force change detection
    this.cdr.detectChanges();
    
    console.log('=== loadComments END ===');
    
  } catch (err) {
    console.error('loadComments unexpected error', err);
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

    // Load attached media
    await this.loadPostMedia();
    await this.loadLikeCount();
    await this.loadComments();
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

  async openCommentPopUp() {
    const flurrId = (this.post as any)?.id ?? (this.post as any)?.flurr_id;
    
    console.log('=== Opening Comment Popup ===');
    console.log('Post ID:', flurrId);
    console.log('Current comments:', this.post?.commentsCount);
    console.log('Current user from @Input:', this.currentUser);
    
    // Get current user info if not already available
    let userInfo = this.currentUser;
    
    if (!userInfo) {
      const uid = await this.getCurrentUid();
      if (uid) {
        const { data: userData } = await supabase
          .from('users')
          .select('full_name, avatar_img, email')
          .eq('user_id', uid)
          .single();
        
        if (userData) {
          userInfo = {
            name: userData.full_name ?? (userData.email ? userData.email.split('@')[0] : 'User'),
            avatarUrl: userData.avatar_img || this.defaultAvatar
          };
          console.log('Fetched user info:', userInfo);
        }
      }
    }
    
    console.log('Opening popup with user:', userInfo);
    
    const dialogRef = this.dialog.open(CommentPopUp, {
      data: { 
        post: this.post, 
        currentUser: userInfo,
        flurrId: flurrId
      },
      width: '600px',
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      console.log('=== Dialog Closed ===');
      console.log('Result:', result);
      
      if (result?.commentsAdded && result.commentsAdded > 0) {
        console.log(`${result.commentsAdded} new comment(s) added in popup`);
        
        // Strategy 1: If popup returned comments, use them immediately
        if (result.comments && result.comments.length > 0) {
          console.log('Using comments from popup:', result.comments.length);
          this.post!.comments = [...result.comments];
          this.post!.commentsCount = (this.post!.commentsCount || 0) + result.commentsAdded;
          this.cdr.detectChanges();
        }
        
        // Strategy 2: Reload from database with a small delay
        console.log('Reloading from database in 200ms...');
        await new Promise(resolve => setTimeout(resolve, 200));
        await this.loadComments();
        
        console.log('Final comment count:', this.post?.commentsCount);
      } else {
        // No new comments, just reload to be safe
        await this.loadComments();
      }
    });
  }

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
          .from('flurr_action')
          .delete()
          .eq('user_id', uid)
          .eq('flurr_id', flurrId)
          .eq('is_liked', true)
          .is('comment_id', null);

        if (error) {
          console.error('onReact unlike error', error);
          this.post.reactions['like'] = currentLikes;
          this.post.userHasLiked = true;
        }
      } else {
        const { error } = await supabase
          .from('flurr_action')
          .insert([{ 
            user_id: uid, 
            flurr_id: flurrId, 
            is_liked: true,
            comment_id: null,
            acted_at: new Date().toISOString()
          }]);

        if (error) {
          console.error('onReact like error', error);
          this.post.reactions['like'] = currentLikes;
          this.post.userHasLiked = false;
        } else {
          try {
            const posterId = (this.post as any).poster?.user_id ?? (this.post as any).poster_id;
            if (posterId && posterId !== uid) {
              await supabase.from('notifications').insert([{
                user_id: posterId,
                actor_id: uid,
                flurr_id: flurrId,
                type: 'like',
                content: 'liked your post',
                created_at: new Date().toISOString()
              }]);
            }
          } catch (notifErr) {
            console.warn('Could not create notification:', notifErr);
          }
        }
      }

      await this.loadLikeCount();
      await this.refreshLikeState();
      
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
    if (!uid || !posterId) return;

    (this.post as any).author = (this.post as any).author || {};
    (this.post as any).author.isFollowed = true;

    try {
      const { error } = await supabase
        .from('friends')
        .insert([{ follower_id: uid, followed_id: posterId }]);
      
      if (error) {
        console.warn('onFollow error', error);
        (this.post as any).author.isFollowed = false;
      } else {
        this.postChanged.emit();
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
    if (!uid || !posterId) return;

    const confirmed = confirm(`Unfollow ${this.post.author?.name ?? 'this user'}?`);
    if (!confirmed) return;

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
      } else {
        this.postChanged.emit();
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

    const commentContent = this.newComment.trim();
    this.newComment = '';
    this.showButton = false;
    this.showComments = true;

    try {
      const { data: commentRow, error: insertErr } = await supabase
        .from('comments')
        .insert([{ 
          content: commentContent, 
          user_id: uid,
          suprerior_comment_id: null,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (insertErr) {
        console.error('submitComment insert error', insertErr);
        alert('Failed to post comment: ' + insertErr.message);
        return;
      }

      const commentId = commentRow.comment_id;

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
        console.error('submitComment link error', linkErr);
      } else {
        try {
          const posterId = (this.post as any).poster?.user_id ?? (this.post as any).poster_id;
          if (posterId && posterId !== uid) {
            await supabase.from('notifications').insert([{
              user_id: posterId,
              actor_id: uid,
              flurr_id: flurrId,
              type: 'comment',
              content: 'commented on your post',
              created_at: new Date().toISOString()
            }]);
          }
        } catch (notifErr) {
          console.warn('Could not create notification:', notifErr);
        }
      }

      await this.loadComments();

    } catch (err) {
      console.error('submitComment unexpected', err);
      alert('An error occurred while posting your comment.');
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
    prompt('Please enter a short reason for reporting this post (optional):');
    this.post.isReported = true;
    this.showMenu = false;
    alert('Thank you — the post has been reported.');
  }

  toggleComments() { this.showComments = !this.showComments; }
  toggleButton() { this.showButton = this.newComment.trim() !== ''; }
  onCommentBlur() { 
    if (!this.newComment.trim()) {
      this.showComments = false; 
    }
  }

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