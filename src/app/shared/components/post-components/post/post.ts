import { Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CommentPopUp } from '../comment-pop-up/comment-pop-up';
import { CommentTree,CommentNode } from '../comment-tree/comment-tree';   // ✅ the recursive component



export interface MediaItem {
  id?: string;
  url: string;
  type: 'image' | 'video';
  mime?: string;
  thumbnailUrl?: string;
  filename?: string;
}

export interface PostInfo {
  id: string;
  title?: string;
  author: { id: string; name: string; avatarUrl?: string; title?: string; isFollowed?: boolean; isBlocked?: boolean };
  content?: string;
  media?: MediaItem[];
  externalUrl?: string;
  externalTitle?: string;
  reactions?: Record<string, number>;
  commentsCount?: number;
  viewsCount?: number;
  createdAt?: string | Date;
  userHasLiked?: boolean;
  isHidden?: boolean;
  isReported?: boolean;
  comments ?: CommentNode[];
}



@Component({
  selector: 'app-post',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, CommentTree],
  templateUrl: './post.html',
  styleUrls: ['./post.css']
})
export class Post implements OnInit, OnDestroy {
  @Input() post: PostInfo | null = null;
  @Input() currentUser: { name: string; avatarUrl: string | null } | null = null;


  defaultAvatar = '../../assets/avatar-img.avif';
  CommentPopUp = CommentPopUp;

  showComments = false;
  showMenu = false;
  newComment = '';
  showButton=false;
  private _outsideClickListener?: (ev: MouseEvent) => void;

  constructor(private host: ElementRef<HTMLElement>, private dialogRef : MatDialog) {}

  openCommentPopUp() {
  const dialogRef = this.dialogRef.open(CommentPopUp, {
    data: { post: this.post, currentUser: this.currentUser }
  });

  dialogRef.afterClosed().subscribe((updatedComments) => {
    if (updatedComments && this.post) {
      this.post.comments = updatedComments;
    }
  });
}


  get firstMedia(): MediaItem | undefined {
    return this.post?.media && this.post.media.length > 0 ? this.post.media[0] : undefined;
  }

  get mediaCount(): number {
    return this.post?.media?.length ?? 0;
  }

  onReact(type: string) {
    if (!this.post) return;
    this.post.reactions = this.post.reactions || {};
    if (type === 'like') {
      if (this.post.userHasLiked) {
        // Unlike
        this.post.reactions['like'] = Math.max((this.post.reactions['like'] || 1) - 1, 0);
        this.post.userHasLiked = false;
      } else {
        // Like
        this.post.reactions['like'] = (this.post.reactions['like'] || 0) + 1;
        this.post.userHasLiked = true;
      }
    }
  }

  toggleComments() { this.showComments = !this.showComments; }

  toggleButton(){
    if(this.newComment.trim()!=""){
      this.showButton=true;
    }else{
      this.showButton=false;
    }
    console.log(this.showButton);
    console.log("hello");
  }
  onCommentBlur() {
  if (!this.newComment.trim()) {
    this.showComments = false;
  }
}

  submitComment() {
  if (!this.newComment.trim() || !this.post || !this.currentUser) return;

  const newComment = new CommentNode(this.newComment.trim(), {
    name: this.currentUser.name,
    avatarUrl: this.currentUser.avatarUrl ?? null,
  });

  if (!this.post.comments) this.post.comments = [];
  this.post.comments.push(newComment);

  this.newComment = '';
  this.showComments = true;
}



  onFollow() {
    if (!this.post) return;
    this.post.author.isFollowed = true;
  }

  onUnfollow() {
    if (!this.post) return;
    this.post.author.isFollowed = false;
  }

  toggleMenu(event?: MouseEvent) {
    if (event) event.stopPropagation();
    this.showMenu = !this.showMenu;
  }

  ngOnInit(): void {
    if (typeof document !== 'undefined') {
      this._outsideClickListener = this.closeMenuOutside.bind(this);
      document.addEventListener('click', this._outsideClickListener);
    }
  }

  ngOnDestroy(): void {
    if (typeof document !== 'undefined' && this._outsideClickListener) {
      document.removeEventListener('click', this._outsideClickListener);
      this._outsideClickListener = undefined;
    }
  }

  closeMenuOutside(event: MouseEvent) {
    if (!this.showMenu) return;
    // if click happened outside this component, close menu
    const hostEl = this.host.nativeElement;
    if (!hostEl.contains(event.target as Node)) {
      this.showMenu = false;
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
    const confirmed = confirm(`Block user ${this.post.author.name}? You won't see their posts anymore.`);
    if (!confirmed) {
      this.showMenu = false;
      return;
    }
    this.post.author.isBlocked = true;
    this.post.isHidden = true; // also hide the post
    this.showMenu = false;
  }

  reportPost() {
    if (!this.post) return;
    const reason = prompt('Please enter a short reason for reporting this post (optional):');
    this.post.isReported = true;
    this.showMenu = false;
    alert('Thank you — the post has been reported.');
  }

  formatHashtags(text?: string): string {
    if (!text) return '';
    const escaped = text
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;');
    return escaped.replace(/(#[\w_-]+)/g, '<a class="hashtag">$1</a>');
  }
}
