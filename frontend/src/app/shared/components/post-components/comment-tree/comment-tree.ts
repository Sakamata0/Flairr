// comment-tree.ts - FIXED to properly save replies to database
import { Component, Input } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { supabase } from '../../../../core/supabase/supabase.client';

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
      this.anwsers = [...this.anwsers];
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
  @Input() flurrId?: string;  // NEW: Need flurr_id to link replies
  vplus: boolean = false;

  openCommentText(comment: CommentNode) {
    comment.isOpen = !comment.isOpen;
  }

  togglevplus() {
    this.vplus = !this.vplus;
  }

  async addComment(comment: CommentNode) {
    const draft = (comment.replyText || '').trim();
    if (!draft || !this.currentUser) return;

    try {
      // Get current user ID
      const { data: sessionData } = await supabase.auth.getSession();
      const uid = sessionData.session?.user?.id;
      
      if (!uid) {
        alert('You must be logged in to reply.');
        return;
      }

      // Get parent comment ID
      const parentCommentId = (comment as any).id;
      
      if (!parentCommentId) {
        console.warn('Parent comment has no ID, cannot save reply to database');
        alert('Cannot reply to this comment (no ID found)');
        return;
      }

      console.log('addComment - Creating reply to comment:', parentCommentId);

      // 1. Insert reply into comments table with parent link
      const { data: replyRow, error: insertErr } = await supabase
        .from('comments')
        .insert([{ 
          content: draft, 
          user_id: uid,
          suprerior_comment_id: parentCommentId, // Link to parent comment
          created_at: new Date().toISOString()
        }])
        .select(`
          comment_id,
          content,
          created_at,
          user:user_id (
            user_id,
            full_name,
            avatar_img,
            email
          )
        `)
        .single();

      if (insertErr) {
        console.error('addComment insert error', insertErr);
        alert('Failed to add reply: ' + insertErr.message);
        return;
      }

      const replyId = replyRow.comment_id;
      console.log('Reply created with ID:', replyId);

      // 2. IMPORTANT: If we have flurrId, link the reply to the post too
      // This ensures the reply shows up when we load comments
      if (this.flurrId) {
        const { error: linkErr } = await supabase
          .from('flurr_action')
          .insert([{ 
            user_id: uid, 
            flurr_id: this.flurrId, 
            comment_id: replyId,
            is_liked: false,
            acted_at: new Date().toISOString()
          }]);

        if (linkErr) {
          console.warn('Could not link reply to post:', linkErr);
          // Don't fail - reply is still created
        } else {
          console.log('Reply linked to post');
        }
      }

      // 3. Add reply to UI with proper author info
      const user = Array.isArray(replyRow.user) ? replyRow.user[0] : replyRow.user;
      const authorName = user?.full_name ?? (user?.email ? user.email.split('@')[0] : this.currentUser.name);
      const authorAvatar = user?.avatar_img || this.currentUser.avatarUrl;

      const reply = new CommentNode(draft, {
        name: authorName,
        avatarUrl: authorAvatar ?? null
      });
      (reply as any).id = replyId;

      comment.addAnwser(reply);

      // 4. Close the reply box
      comment.isOpen = false;
      comment.replyText = '';

      // 5. Make sure the new answer is visible immediately
      this.vplus = true;

      console.log('Reply added successfully');

    } catch (err) {
      console.error('addComment unexpected error', err);
      alert('An error occurred while adding your reply.');
    }
  }
}