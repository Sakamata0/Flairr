import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommentTree, CommentNode } from '../comment-tree/comment-tree';

@Component({
  selector: 'comment-pop-up',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, NgIf, CommentTree],
  templateUrl: './comment-pop-up.html',
  styleUrls: ['./comment-pop-up.css']
})
export class CommentPopUp implements OnInit {
  comments: CommentNode[] = [];
  text: string = '';
  currentUser: { name: string; avatarUrl: string | null } | null = null;


  constructor(
    private dialogRef: MatDialogRef<CommentPopUp>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    if (this.data?.post?.comments) {
      this.comments = this.data.post.comments;
    }

    if (this.data?.currentUser) {
      this.currentUser = this.data.currentUser;
    }
  }

  addNewRootComment() {
  if (!this.text.trim() || !this.data.currentUser) return;
  const newComment = new CommentNode(this.text.trim(), this.data.currentUser);
  this.comments.push(newComment);
  this.comments = [...this.comments];
  this.text = '';
  if (this.data?.post) {
  this.data.post.commentsCount = (this.data.post.commentsCount || 0) + 1;
}

}



  closePopup() {
    this.dialogRef.close(this.comments);
  }
}
