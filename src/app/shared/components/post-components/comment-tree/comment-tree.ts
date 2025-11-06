import { Component, Input } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

export class CommentNode {
  text: string = '';
  author?: { name: string; avatarUrl: string | null };
  anwsers: CommentNode[] = [];
  isOpen: boolean = false;

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
  text: string = '';
@Input() currentUser!: { name: string; avatarUrl: string | null };

  openCommentText(comment: CommentNode) {
    comment.isOpen = !comment.isOpen;
  }

 addComment(comment: CommentNode) {
  if (!this.text.trim() || !this.currentUser) return;

  const reply = new CommentNode(this.text, {
    name: this.currentUser.name,
    avatarUrl: this.currentUser.avatarUrl ?? null
  });

  comment.addAnwser(reply);
  comment.isOpen = false;
  this.text = '';
}

}
