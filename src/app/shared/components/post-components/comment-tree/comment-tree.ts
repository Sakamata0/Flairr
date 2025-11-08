import { Component, Input } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

export class CommentNode {
  text: string = '';
  author?: { name: string; avatarUrl: string | null };
  anwsers: CommentNode[] = [];
  isOpen: boolean = false;

  replyText?: string;

  constructor(text: string, author?: { name: string; avatarUrl: string | null }) {
    this.text = text;
    this.author = author;
  }

  addAnwser(newComment: CommentNode) {
    if (newComment && newComment.text) {
      this.anwsers.push(newComment);
    }
  }
}

@Component({
  selector: 'comment-tree',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIf, NgFor],
  templateUrl: './comment-tree.html',
  styleUrls: ['./comment-tree.css']
})
export class CommentTree {
  @Input() comments: CommentNode[] = [];
  @Input() currentUser!: { name: string; avatarUrl: string | null };

  openCommentText(comment: CommentNode) {
    comment.isOpen = !comment.isOpen;
  }

  addComment(comment: CommentNode) {
    const draft = (comment.replyText || '').trim();
    if (!draft || !this.currentUser) return;

    const reply = new CommentNode(draft, {
      name: this.currentUser.name,
      avatarUrl: this.currentUser.avatarUrl ?? null
    });

    comment.addAnwser(reply);
    comment.isOpen = false;
    comment.replyText = '';
  }
}
