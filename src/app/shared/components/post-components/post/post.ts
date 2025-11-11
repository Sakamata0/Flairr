import { Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CommentPopUp } from '../comment-pop-up/comment-pop-up';
import { CommentTree,CommentNode } from '../comment-tree/comment-tree';
import { PostInfo } from '../../../model/post/post-info.type';
import { MediaItem } from '../../../model/post/media-item.type';

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, CommentTree],
  templateUrl: './post.html',
  styleUrls: ['./post.css']
})
export class Post implements OnInit, OnDestroy {
  @Input() post: PostInfo | null = {
    id: 'p1',
    title: 'Flairr Journey: #Building_my_first_full-stack_app',
    author: { id: 'u1', name: 'Catharina', avatarUrl: 'assets/icons/post/avatar2-img.avif', title: '', isFollowed: false },
    content: "🚀 Just finished connecting my Angular frontend #hhahaa to my Node.js API!\nIt took me two days to fix a CORS issue 😂 but I finally understand how it works.\nNext step: adding authentication.\nIf anyone has experience with JWT best practices, I'd love some advice 👇",
    media: [{ url: 'assets/icons/post/post-img.png', type: 'image', filename: 'screenshot.png' }],
    reactions: { like: 232 },
    commentsCount: 120,
    viewsCount: 1500,
    createdAt: new Date()
  };
  @Input() currentUser: { name: string; avatarUrl: string | null } | null = {
    name: 'Mohamed Houcine',
    avatarUrl: 'assets/icons/post/avatar-img.avif'
  };


  defaultAvatar = 'assets/icons/post/avatar-img.avif';
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
