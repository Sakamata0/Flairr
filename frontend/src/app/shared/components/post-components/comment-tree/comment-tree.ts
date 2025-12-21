// comment-tree.ts - FIXED: Replies stay as replies, not root comments
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
  @Input() flurrId?: string;
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

      // CRITICAL FIX: Only insert reply into comments table with parent link
      // DO NOT add to flurr_action - that would make it a root comment
      const { data: replyRow, error: insertErr } = await supabase
        .from('comments')
        .insert([{ 
          content: draft, 
          user_id: uid,
          suprerior_comment_id: parentCommentId, // Link to parent comment ONLY
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
      console.log('Reply is linked to parent via suprerior_comment_id ONLY');

      // Create notification for the parent comment author
      try {
        // Get the parent comment's author
        const parentAuthorId = (comment.author as any)?.userId || (comment as any)?.userId;
        
        if (parentAuthorId && parentAuthorId !== uid) {
          await supabase.from('notifications').insert([{
            user_id: parentAuthorId,
            actor_id: uid,
            flurr_id: this.flurrId || null,
            type: 'reply',
            content: 'replied to your comment',
            created_at: new Date().toISOString()
          }]);
          console.log('Reply notification sent to parent comment author');
        }
      } catch (notifErr) {
        console.warn('Could not create reply notification:', notifErr);
      }

      // Add reply to UI with proper author info
      const user = Array.isArray(replyRow.user) ? replyRow.user[0] : replyRow.user;
      const authorName = user?.full_name ?? (user?.email ? user.email.split('@')[0] : this.currentUser.name);
      const authorAvatar = user?.avatar_img || this.currentUser.avatarUrl;

      const reply = new CommentNode(draft, {
        name: authorName,
        avatarUrl: authorAvatar ?? null
      });
      (reply as any).id = replyId;

      comment.addAnwser(reply);

      // Close the reply box
      comment.isOpen = false;
      comment.replyText = '';

      // Make sure the new answer is visible immediately
      this.vplus = true;

      console.log('Reply added successfully and will remain a reply after refresh');

    } catch (err) {
      console.error('addComment unexpected error', err);
      alert('An error occurred while adding your reply.');
    }
  }
}
