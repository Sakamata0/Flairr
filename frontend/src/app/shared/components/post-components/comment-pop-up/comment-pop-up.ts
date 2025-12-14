// comment-pop-up.ts - COMPREHENSIVE FIX
import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommentTree, CommentNode } from '../comment-tree/comment-tree';
import { supabase } from '../../../../core/supabase/supabase.client';

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
  flurrId: string | null = null;
  defaultAvatar = 'assets/icons/post/avatar-img.avif';
  commentsAdded: number = 0; // Track how many comments were added

  constructor(
    private dialogRef: MatDialogRef<CommentPopUp>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    console.log('=== CommentPopUp Init ===');
    console.log('Data received:', this.data);
    
    if (this.data?.post?.comments) {
      this.comments = [...this.data.post.comments]; // Clone the array
      console.log('Loaded comments:', this.comments.length);
    }

    if (this.data?.currentUser) {
      this.currentUser = this.data.currentUser;
      console.log('Current user:', this.currentUser?.name);
    }

    if (this.data?.flurrId) {
      this.flurrId = this.data.flurrId;
      console.log('Flurr ID:', this.flurrId);
    } else {
      console.warn('WARNING: No flurrId provided to popup!');
    }
  }

  async addNewRootComment() {
    if (!this.text.trim() || !this.currentUser) {
      console.warn('Cannot add comment: text or user missing');
      return;
    }

    if (!this.flurrId) {
      alert('Error: Cannot add comment - post ID is missing');
      return;
    }
    
    const commentContent = this.text.trim();
    this.text = '';

    console.log('=== Adding Comment from Popup ===');
    console.log('Content:', commentContent);
    console.log('FlurrId:', this.flurrId);

    try {
      // Get current user ID
      const { data: sessionData } = await supabase.auth.getSession();
      const uid = sessionData.session?.user?.id;
      
      if (!uid) {
        alert('You must be logged in to comment.');
        return;
      }

      console.log('User ID:', uid);

      // 1. Insert comment into comments table
      console.log('Step 1: Inserting comment...');
      const { data: commentRow, error: insertErr } = await supabase
        .from('comments')
        .insert([{ 
          content: commentContent, 
          user_id: uid,
          suprerior_comment_id: null,
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
        console.error('Failed to insert comment:', insertErr);
        alert('Failed to add comment: ' + insertErr.message);
        return;
      }

      const commentId = commentRow.comment_id;
      console.log('✓ Comment inserted with ID:', commentId);

      // 2. Link comment to post via flurr_action
      console.log('Step 2: Linking comment to post...');
      const { error: linkErr } = await supabase
        .from('flurr_action')
        .insert([{ 
          user_id: uid, 
          flurr_id: this.flurrId, 
          comment_id: commentId,
          is_liked: false,
          acted_at: new Date().toISOString()
        }]);

      if (linkErr) {
        console.error('Failed to link comment:', linkErr);
        
        if (linkErr.message?.includes('notifications') && linkErr.message?.includes('row-level security')) {
          console.warn('Comment created but notification could not be sent (RLS issue)');
        } else {
          alert('Comment created but not linked: ' + linkErr.message);
          return;
        }
      } else {
        console.log('✓ Comment linked to post');
      }

      // 3. Verify the link was created by querying back
      console.log('Step 3: Verifying link...');
      const { data: verifyData, error: verifyErr } = await supabase
        .from('flurr_action')
        .select('comment_id')
        .eq('flurr_id', this.flurrId)
        .eq('comment_id', commentId)
        .single();

      if (verifyErr) {
        console.error('Could not verify link:', verifyErr);
      } else {
        console.log('✓ Link verified:', verifyData);
      }

      // 4. Add to local UI
      const user = Array.isArray(commentRow.user) ? commentRow.user[0] : commentRow.user;
      const authorName = user?.full_name ?? (user?.email ? user.email.split('@')[0] : this.currentUser.name);
      const authorAvatar = user?.avatar_img || this.currentUser.avatarUrl || this.defaultAvatar;

      const newComment = new CommentNode(commentContent, {
        name: authorName,
        avatarUrl: authorAvatar ?? null
      });
      (newComment as any).id = commentId;
      
      this.comments.push(newComment);
      this.comments = [...this.comments]; // Trigger change detection
      this.commentsAdded++;
      
      console.log('✓ Comment added to UI');
      console.log('Total comments in popup:', this.comments.length);
      console.log('Comments added this session:', this.commentsAdded);

    } catch (err) {
      console.error('Unexpected error adding comment:', err);
      alert('An error occurred while adding your comment.');
    }
  }

  closePopup() {
    console.log('=== Closing Popup ===');
    console.log('Comments in popup:', this.comments.length);
    console.log('Comments added:', this.commentsAdded);
    
    this.dialogRef.close({ 
      comments: this.comments,
      commentsAdded: this.commentsAdded,
      needsRefresh: true 
    });
  }
}