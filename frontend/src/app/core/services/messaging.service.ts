// src/app/services/messaging.service.ts
import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// Local models — adjust import paths if you placed models elsewhere
import {
  Contact,
  Message,
  DbMessageRow,
  DbUserRow,
  DbConversationRow
} from '../../shared/model/messaging.models';

@Injectable({ providedIn: 'root' })
export class MessagingService implements OnDestroy {
  private supabase: SupabaseClient;
  private channels = new Map<string, RealtimeChannel>();

  constructor(private ngZone: NgZone) {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseAnonKey);
  }

  // ----------------------
  // Auth helper
  // ----------------------
  async getCurrentUserId(): Promise<string> {
    const { data, error } = await this.supabase.auth.getUser();
    if (error) throw error;
    const user = data?.user;
    if (!user) throw new Error('No authenticated user found');
    return user.id;
  }

  async getCurrentUser() {
    const { data, error } = await this.supabase.auth.getUser();
    if (error) {
      console.error("AUTH ERROR:", error);
      return null;
    }
    return data.user;
  }


  // ----------------------
  // Conversations / Contacts
  // ----------------------
  /**
   * Fetch all conversations for the current user and return Contact[].
   * Each Contact.id is the other user's user_id (as requested)
   * and contact.conversationId contains the conversation id to load messages.
   */
  async fetchConversations(): Promise<Contact[]> {
    const currentUserId = await this.getCurrentUserId();

    // 1) get all conversation ids where current user participates
    const { data: parts, error: partsErr } = await this.supabase
      .from('participants')
      .select('conversation_id')
      .eq('user_id', currentUserId);

    if (partsErr) throw partsErr;
    if (!parts || parts.length === 0) return [];

    const convIds = Array.from(new Set(parts.map((p: any) => p.conversation_id)));

    // 2) For each conversation find the other participant, last message, and other user's row
    const contacts: Contact[] = await Promise.all(
      convIds.map(async (convId: string) => {
        // find other participant (user_id != currentUserId)
        const { data: otherParts, error: otherErr } = await this.supabase
          .from('participants')
          .select('user_id')
          .eq('conversation_id', convId)
          .neq('user_id', currentUserId)
          .limit(1);

        if (otherErr) throw otherErr;

        // If group chats exist (multiple other participants) we pick the first one for preview.
        // If no other participant (shouldn't happen), fall back to current user as placeholder.
        const otherUserId = otherParts && otherParts.length ? otherParts[0].user_id : currentUserId;

        // fetch other user row
        const { data: users, error: userErr } = await this.supabase
          .from('users')
          .select('user_id, full_name, avatar_img')
          .eq('user_id', otherUserId)
          .limit(1)
          .single();

        if (userErr) {
          // If user not found, create a minimal object
          // don't throw here to keep UI resilient
        }
        const otherUser: DbUserRow = users ?? { user_id: otherUserId, full_name: null, avatar_img: null };

        // fetch last message for that conversation
        const { data: lastMsgRows, error: lastErr } = await this.supabase
          .from('messages')
          .select('id, content, created_at, author_id')
          .eq('conversation_id', convId)
          .order('created_at', { ascending: false })
          .limit(1);

        if (lastErr) throw lastErr;
        const lastMsg = lastMsgRows && lastMsgRows.length ? lastMsgRows[0] : null;

        const contact: Contact = {
          id: otherUser.user_id,
          name: otherUser.full_name ?? otherUser.user_id,
          avatar: otherUser.avatar_img ?? null,
          lastMessage: lastMsg?.content ?? null,
          unreadCount: 0, // simple default — you can implement read-tracking later
          lastAt: lastMsg?.created_at ?? null,
          online: false,
          // conversationId is important for loading messages
          // attach it here so UI can load messages fast
          // @ts-ignore - we add dynamic property to Contact as agreed
          conversationId: convId
        };
        
        return contact;
      })
    );

    // sort contacts by lastAt descending
    contacts.sort((a, b) => {
      const ta = a.lastAt ? new Date(a.lastAt).getTime() : 0;
      const tb = b.lastAt ? new Date(b.lastAt).getTime() : 0;
      return tb - ta;
    });
    console.log('fetchConversations - convIds', convIds);
    return contacts;
  }

  /**
   * Find an existing conversation between current user and otherUserId, or create one.
   * Returns conversation id.
   */
  async findOrCreateConversation(otherUserId: string): Promise<string> {
    const currentUserId = await this.getCurrentUserId();

    if (currentUserId === otherUserId) {
      // create a one-person conversation (edge case) or throw — we'll create a convo anyway
    }

    // 1) fetch participants rows for both user ids (client-side grouping)
    const { data: rows, error: pErr } = await this.supabase
      .from('participants')
      .select('conversation_id, user_id')
      .in('user_id', [currentUserId, otherUserId]);

    if (pErr) throw pErr;

    // group by conversation_id and look for conv that has both user ids
    const convMap = new Map<string, Set<string>>();
    (rows ?? []).forEach((r: any) => {
      const set = convMap.get(r.conversation_id) ?? new Set<string>();
      set.add(r.user_id);
      convMap.set(r.conversation_id, set);
    });

    for (const [convId, userSet] of convMap.entries()) {
      if (userSet.has(currentUserId) && userSet.has(otherUserId)) {
        return convId; // existing conversation found
      }
    }

    // 2) Not found: create a new conversation + participants
    const { data: convData, error: convErr } = await this.supabase
      .from('conversations')
      .insert({}) // only created_at default is added
      .select('id')
      .limit(1)
      .single();

    if (convErr) throw convErr;
    const newConvId: string = convData.id;

    // insert participants (current user and other user)
    const inserts = [
      { conversation_id: newConvId, user_id: currentUserId },
      { conversation_id: newConvId, user_id: otherUserId }
    ];
    const { error: insErr } = await this.supabase.from('participants').insert(inserts);
    if (insErr) throw insErr;

    return newConvId;
  }

  // ----------------------
  // Messages
  // ----------------------
  // fetch messages and attach author info in bulk
  async fetchMessages(convId: string, limit = 100): Promise<Message[]> {
    // fetch messages
    const { data: rows, error } = await this.supabase
      .from('messages')
      .select('id, conversation_id, author_id, content, created_at')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) throw error;
    const msgRows: DbMessageRow[] = rows ?? [];

    // collect unique author ids
    const authorIds = Array.from(new Set(msgRows.map(m => m.author_id)));

    let usersById: Record<string, DbUserRow> = {};
    if (authorIds.length) {
      const { data: users, error: usersErr } = await this.supabase
        .from('users')
        .select('user_id, full_name, avatar_img')
        .in('user_id', authorIds);

      if (usersErr) throw usersErr;
      for (const u of users ?? []) {
        usersById[u.user_id] = u;
      }
    }

    // map to UI messages
    const currentUserId = await this.getCurrentUserId();
    const uiMessages: Message[] = msgRows.map(r =>
    // dynamic import of mapping to avoid circular deps; inline mapping:
    ({
      id: r.id,
      conversation_id: r.conversation_id,
      authorId: r.author_id,
      authorName: usersById[r.author_id]?.full_name ?? undefined,
      content: r.content,
      created_at: r.created_at ?? new Date().toISOString(),
      from: currentUserId ? (r.author_id === currentUserId ? 'me' : 'them') : undefined,
      avatar: usersById[r.author_id]?.avatar_img ?? undefined
    })
    );

    return uiMessages;
  }

  /**
   * insert a message into DB for a conversation
   */
  async sendMessage(conversationId: string, content: string): Promise<Message> {
    const currentUserId = await this.getCurrentUserId();
    const { data, error } = await this.supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        author_id: currentUserId,
        content
      })
      .select('*')
      .limit(1)
      .single();

    if (error) throw error;

    // fetch author info
    const { data: userRow } = await this.supabase
      .from('users')
      .select('user_id, full_name, avatar_img')
      .eq('user_id', currentUserId)
      .limit(1)
      .single();



    const ui: Message = {
      id: data.id,
      conversation_id: data.conversation_id,
      authorId: data.author_id,
      authorName: userRow?.full_name ?? undefined,
      content: data.content,
      created_at: data.created_at,
      from: 'me',
      avatar: userRow?.avatar_img ?? undefined
    };

    return ui;
  }

  // ----------------------
  // Realtime subscriptions
  // ----------------------
  subscribeToMessages(convId: string, onMessage: (msg: Message) => void): RealtimeChannel {
    const key = `messages:conv:${convId}`;
    if (this.channels.has(key)) return this.channels.get(key)!;

    const filter = `conversation_id=eq.${convId}`;
    const channel = this.supabase
      .channel(`public:messages:${convId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter },
        async (payload) => {
          // payload.new is the raw message row
          const raw: DbMessageRow = payload.new as DbMessageRow;
          // fetch author row
          let author: DbUserRow | null = null;
          try {
            const { data: userRow } = await this.supabase
              .from('users')
              .select('user_id, full_name, avatar_img')
              .eq('user_id', raw.author_id)
              .limit(1)
              .single();
            author = userRow ?? null;
          } catch (err) {
            // ignore author fetch error
          }

          this.ngZone.run(() => {
            try {
              const currentUserIdPromise = this.getCurrentUserId();
              // map and call onMessage (we await currentUserId inside)
              currentUserIdPromise.then(currentUserId => {
                const mapped: Message = {
                  id: raw.id,
                  conversation_id: raw.conversation_id,
                  authorId: raw.author_id,
                  authorName: author?.full_name ?? undefined,
                  content: raw.content,
                  created_at: raw.created_at ?? undefined,
                  from: currentUserId ? (raw.author_id === currentUserId ? 'me' : 'them') : undefined,
                  avatar: author?.avatar_img ?? undefined
                };
                onMessage(mapped);
              });
            } catch (e) {
              // swallow to keep subscription alive
            }
          });
        }
      );

    channel.subscribe();
    this.channels.set(key, channel);
    return channel;
  }

  observeMessages(convId: string): Observable<Message> {
    return new Observable<Message>((subscriber) => {
      const channel = this.subscribeToMessages(convId, (msg) => subscriber.next(msg));
      return () => {
        this.unsubscribeChannel(channel);
      };
    });
  }

  unsubscribeChannel(channel: RealtimeChannel | null | undefined) {
    if (!channel) return;
    try {
      this.supabase.removeChannel(channel);
    } catch {
      try {
        // @ts-ignore
        if (typeof channel.unsubscribe === 'function') channel.unsubscribe();
      } catch { /* ignore */ }
    }
    // remove from map
    try {
      // @ts-ignore
      const topic = channel.topic ?? channel.name ?? null;
      if (topic) {
        for (const [k, v] of this.channels.entries()) {
          if (v === channel || k.includes(topic)) this.channels.delete(k);
        }
      } else {
        for (const [k, v] of this.channels.entries()) {
          if (v === channel) this.channels.delete(k);
        }
      }
    } catch { /* ignore */ }
  }

  ngOnDestroy(): void {
    for (const ch of Array.from(this.channels.values())) {
      try { this.supabase.removeChannel(ch); } catch { /* ignore */ }
    }
    this.channels.clear();
  }
}


