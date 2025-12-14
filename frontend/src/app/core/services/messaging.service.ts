// src/app/services/messaging.service.ts
import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';

import {
    Contact,
    Message,
    DbMessageRow,
    DbUserRow,
} from '../../shared/model/messaging.models';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class MessagingService implements OnDestroy {
    private supabase: SupabaseClient;
    private channels = new Map<string, RealtimeChannel>();
    private userCache = new Map<string, DbUserRow | null>();

    private subscribeRetryDelay = 2000;
    private channelRetryCount = new Map<string, number>();
    private maxChannelRetries = 3;
    private pendingRetries = new Set<string>();

    // Subject to emit contact updates (new messages, read status changes)
    private contactUpdates$ = new Subject<{ conversationId: string; update: Partial<Contact> }>();

    constructor(
        private ngZone: NgZone,
        private supabaseService: SupabaseService
    ) {
        this.supabase = this.supabaseService.client;

        // optional, only for debugging
        try {
            (window as any).supabase = this.supabase;
        } catch {}
    }

    /**
     * Observable to listen for contact updates
     */
    get contactUpdates(): Observable<{ conversationId: string; update: Partial<Contact> }> {
        return this.contactUpdates$.asObservable();
    }

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
            console.error('AUTH ERROR:', error);
            return null;
        }
        return data.user;
    }

    private async fetchUserCached(userId: string): Promise<DbUserRow | null> {
        if (!userId) return null;
        if (this.userCache.has(userId)) return this.userCache.get(userId) ?? null;

        try {
            const { data, error } = await this.supabase
                .from('users')
                .select('user_id, full_name, avatar_img')
                .eq('user_id', userId)
                .limit(1)
                .single();

            if (error) {
                this.userCache.set(userId, null);
                return null;
            }
            this.userCache.set(userId, data);
            return data;
        } catch (err) {
            this.userCache.set(userId, null);
            return null;
        }
    }

    /**
     * Get conversation details including the other participant's information
     */
    async getConversationDetails(
        conversationId: string
    ): Promise<{ otherUser: DbUserRow; conversationId: string } | null> {
        try {
            const currentUserId = await this.getCurrentUserId();
            if (!currentUserId) return null;

            // Get the other user directly from participants table
            const { data: participant, error: participantErr } = await this.supabase
                .from('participants')
                .select('other_user_id')
                .eq('conversation_id', conversationId)
                .eq('user_id', currentUserId)
                .single();

            if (participantErr) throw participantErr;
            if (!participant?.other_user_id) {
                console.warn('No other_user_id found for conversation', conversationId);
                return null;
            }

            const otherUserId = participant.other_user_id;

            // Fetch other user's details
            const { data: otherUser, error: userErr } = await this.supabase
                .from('users')
                .select('user_id, full_name, avatar_img')
                .eq('user_id', otherUserId)
                .single();

            if (userErr) throw userErr;

            return {
                otherUser,
                conversationId
            };
        } catch (err) {
            console.error('Error getting conversation details:', err);
            return null;
        }
    }



    /**
     * Mark a conversation as read by the current user
     */
    async markConversationAsRead(conversationId: string): Promise<void> {
        try {
            const currentUserId = await this.getCurrentUserId();

            const { data: latestMsg, error: msgErr } = await this.supabase
                .from('messages')
                .select('id, created_at')
                .eq('conversation_id', conversationId)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (msgErr && msgErr.code !== 'PGRST116') {
                console.error('Error fetching latest message:', msgErr);
            }

            const { error: upsertErr } = await this.supabase
                .from('conversation_reads')
                .upsert({
                    user_id: currentUserId,
                    conversation_id: conversationId,
                    last_read_at: new Date().toISOString(),
                    last_read_message_id: latestMsg?.id || null
                }, {
                    onConflict: 'user_id,conversation_id'
                });

            if (upsertErr) {
                console.error('Error marking conversation as read:', upsertErr);
            } else {
                console.log('✅ Marked conversation as read:', conversationId);
            }
        } catch (err) {
            console.error('Error in markConversationAsRead:', err);
        }
    }

    /**
     * Get unread message count for a specific conversation
     */
    async getUnreadCount(conversationId: string): Promise<number> {
        try {
            const currentUserId = await this.getCurrentUserId();

            const { data: readData, error: readErr } = await this.supabase
                .from('conversation_reads')
                .select('last_read_at')
                .eq('user_id', currentUserId)
                .eq('conversation_id', conversationId)
                .single();

            if (readErr && readErr.code !== 'PGRST116') {
                console.error('Error fetching read status:', readErr);
                return 0;
            }

            const lastReadAt = readData?.last_read_at;

            if (!lastReadAt) {
                const { count, error: countErr } = await this.supabase
                    .from('messages')
                    .select('*', { count: 'exact', head: true })
                    .eq('conversation_id', conversationId)
                    .neq('author_id', currentUserId);

                if (countErr) {
                    console.error('Error counting unread messages:', countErr);
                    return 0;
                }

                return count || 0;
            }

            const { count, error: countErr } = await this.supabase
                .from('messages')
                .select('*', { count: 'exact', head: true })
                .eq('conversation_id', conversationId)
                .neq('author_id', currentUserId)
                .gt('created_at', lastReadAt);

            if (countErr) {
                console.error('Error counting unread messages:', countErr);
                return 0;
            }

            return count || 0;
        } catch (err) {
            console.error('Error in getUnreadCount:', err);
            return 0;
        }
    }

    async fetchConversations(): Promise<Contact[]> {
        const currentUserId = await this.getCurrentUserId();
        console.log('🔍 Current User ID:', currentUserId);

        const { data: parts, error: partsErr } = await this.supabase
            .from('participants')
            .select('conversation_id')
            .eq('user_id', currentUserId);

        if (partsErr) throw partsErr;
        if (!parts || parts.length === 0) return [];

        const convIds = Array.from(new Set(parts.map((p: any) => p.conversation_id)));
        console.log('📋 Conversation IDs:', convIds);

        const contacts: Contact[] = await Promise.all(
            convIds.map(async (convId: string) => {
                const { data: allParticipants, error: allPartsErr } = await this.supabase
                    .from('participants')
                    .select('user_id')
                    .eq('conversation_id', convId);

                if (allPartsErr) throw allPartsErr;

                const otherUserIds = allParticipants
                    ?.map((p: any) => p.user_id)
                    .filter((uid: string) => uid !== currentUserId) || [];

                console.log(`👥 Conversation ${convId}:`, {
                    allParticipants: allParticipants?.map(p => p.user_id),
                    currentUserId,
                    otherUserIds
                });

                const otherUserId = otherUserIds.length > 0 ? otherUserIds[0] : currentUserId;

                let otherUser: DbUserRow = { user_id: otherUserId, full_name: null, avatar_img: null };
                try {
                    const { data: users, error: userErr } = await this.supabase
                        .from('users')
                        .select('user_id, full_name, avatar_img')
                        .eq('user_id', otherUserId)
                        .limit(1)
                        .single();

                    console.log(`👤 Other user details for ${otherUserId}:`, users);

                    if (!userErr && users) {
                        otherUser = users;
                        this.userCache.set(otherUserId, users);
                    } else {
                        console.warn('⚠️ Could not fetch user details:', userErr);
                    }
                } catch (err) {
                    console.error('❌ Error fetching user:', err);
                    if (!this.userCache.has(otherUserId)) this.userCache.set(otherUserId, null);
                }

                const { data: lastMsgRows, error: lastErr } = await this.supabase
                    .from('messages')
                    .select('id, content, created_at, author_id')
                    .eq('conversation_id', convId)
                    .order('created_at', { ascending: false })
                    .limit(1);

                if (lastErr) throw lastErr;
                const lastMsg = lastMsgRows && lastMsgRows.length ? lastMsgRows[0] : null;

                const unreadCount = await this.getUnreadCount(convId);

                const contact: Contact = {
                    id: otherUser.user_id,
                    name: otherUser.full_name ?? otherUser.user_id,
                    avatar: otherUser.avatar_img ?? null,
                    lastMessage: lastMsg?.content ?? null,
                    unreadCount: unreadCount,
                    lastAt: lastMsg?.created_at ?? null,
                    online: false,
                    conversationId: convId
                };

                console.log('✅ Built contact:', contact);

                return contact;
            })
        );

        contacts.sort((a, b) => {
            const ta = a.lastAt ? new Date(a.lastAt).getTime() : 0;
            const tb = b.lastAt ? new Date(b.lastAt).getTime() : 0;
            return tb - ta;
        });

        console.log('📇 Final contacts list:', contacts);

        return contacts;
    }

    async findOrCreateConversation(otherUserId: string): Promise<string> {
        const currentUserId = await this.getCurrentUserId();

        const { data: rows, error: pErr } = await this.supabase
            .from('participants')
            .select('conversation_id, user_id')
            .in('user_id', [currentUserId, otherUserId]);

        if (pErr) throw pErr;

        const convMap = new Map<string, Set<string>>();
        (rows ?? []).forEach((r: any) => {
            const set = convMap.get(r.conversation_id) ?? new Set<string>();
            set.add(r.user_id);
            convMap.set(r.conversation_id, set);
        });

        for (const [convId, userSet] of convMap.entries()) {
            if (userSet.has(currentUserId) && userSet.has(otherUserId)) {
                return convId;
            }
        }

        const { data: convData, error: convErr } = await this.supabase
            .from('conversations')
            .insert({})
            .select('id')
            .limit(1)
            .single();

        if (convErr) throw convErr;
        const newConvId: string = convData.id;

        const inserts = [
            { conversation_id: newConvId, user_id: currentUserId },
            { conversation_id: newConvId, user_id: otherUserId }
        ];
        const { error: insErr } = await this.supabase.from('participants').insert(inserts);
        if (insErr) throw insErr;

        return newConvId;
    }

    async fetchMessages(convId: string, limit = 100): Promise<Message[]> {
        const { data: rows, error } = await this.supabase
            .from('messages')
            .select('id, conversation_id, author_id, content, created_at')
            .eq('conversation_id', convId)
            .order('created_at', { ascending: true })
            .limit(limit);

        if (error) throw error;
        const msgRows: DbMessageRow[] = rows ?? [];

        const authorIds = Array.from(new Set(msgRows.map(m => m.author_id)));
        await Promise.all(authorIds.map(id => this.fetchUserCached(id)));

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

        const currentUserId = await this.getCurrentUserId();
        const uiMessages: Message[] = msgRows.map(r => ({
            id: r.id,
            conversation_id: r.conversation_id,
            authorId: r.author_id,
            authorName: usersById[r.author_id]?.full_name ?? undefined,
            content: r.content,
            created_at: r.created_at ?? new Date().toISOString(),
            from: currentUserId ? (r.author_id === currentUserId ? 'me' : 'them') : undefined,
            avatar: usersById[r.author_id]?.avatar_img ?? undefined
        }));

        return uiMessages;
    }

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

        const userRow = await this.fetchUserCached(currentUserId);

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

    private async handleDatabaseChange(
        payload: any,
        convId: string,
        currentUserId: string | null,
        onMessage: (m: Message) => void
    ) {
        try {
            console.log('🔔 [Realtime] Database change received:', payload);

            const { eventType, new: newRecord, old: oldRecord } = payload;

            const record = newRecord || oldRecord;
            if (!record) {
                console.warn('⚠️ [Realtime] No record in payload');
                return;
            }

            if (String(record.conversation_id) !== String(convId)) {
                console.log('⚠️ [Realtime] Conversation ID mismatch, ignoring');
                return;
            }

            if (eventType !== 'INSERT' && eventType !== 'UPDATE') {
                console.log('ℹ️ [Realtime] Ignoring event type:', eventType);
                return;
            }

            const author = await this.fetchUserCached(record.author_id);
            const currentUser = currentUserId || (await this.getCurrentUserId().catch(() => null));

            const mapped: Message = {
                id: record.id,
                conversation_id: record.conversation_id,
                authorId: record.author_id,
                authorName: author?.full_name ?? undefined,
                content: record.content,
                created_at: record.created_at ?? undefined,
                from: currentUser ? (record.author_id === currentUser ? 'me' : 'them') : undefined,
                avatar: author?.avatar_img ?? undefined
            };

            console.log('✅ [Realtime] Mapped message:', mapped);

            this.ngZone.run(() => {
                try {
                    onMessage(mapped);
                    console.log('✅ [Realtime] onMessage callback executed');

                    // Emit contact update for the contacts list
                    this.contactUpdates$.next({
                        conversationId: convId,
                        update: {
                            lastMessage: mapped.content,
                            lastAt: mapped.created_at
                        }
                    });
                    console.log('📢 [Realtime] Emitted contact update');

                } catch (err) {
                    console.error('❌ [Realtime] onMessage callback error', err);
                }
            });
        } catch (err) {
            console.error('❌ [Realtime] handler error', err);
        }
    }

    private ensureSubscribed(
        channel: RealtimeChannel,
        key: string,
        convId: string,
        onMessage: (m: Message) => void
    ) {
        channel.subscribe((status, err) => {
            if (status === 'SUBSCRIBED') {
                this.channelRetryCount.delete(key);
                this.pendingRetries.delete(key);
                return;
            }

            if (status === 'CLOSED' || status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                console.error(`[Realtime] Channel ${key} failed with status: ${status}`, err);

                if (this.pendingRetries.has(key)) {
                    return;
                }

                const retryCount = this.channelRetryCount.get(key) ?? 0;

                if (retryCount >= this.maxChannelRetries) {
                    console.error(`[Realtime] Max retries reached for ${key}`);
                    this.cleanupChannel(key, channel);
                    return;
                }

                this.pendingRetries.add(key);
                this.channelRetryCount.set(key, retryCount + 1);

                setTimeout(async () => {
                    try {
                        this.cleanupChannel(key, channel);
                        await this.subscribeToMessages(convId, onMessage);
                    } catch (err) {
                        console.error('[Realtime] Resubscribe failed', err);
                        this.pendingRetries.delete(key);
                    }
                }, this.subscribeRetryDelay);
            }
        });
    }

    private cleanupChannel(key: string, channel: RealtimeChannel) {
        try {
            this.supabase.removeChannel(channel);
        } catch (err) {
            console.warn('[cleanupChannel] error', err);
        }
        this.channels.delete(key);
    }

    async subscribeToMessages(convId: string, onMessage: (msg: Message) => void): Promise<RealtimeChannel> {
        if (!convId) throw new Error('subscribeToMessages: convId required');

        const key = `conversation:${convId}:messages`;

        if (this.channels.has(key)) {
            return this.channels.get(key)!;
        }

        let currentUserId: string | null = null;
        try {
            currentUserId = await this.getCurrentUserId();
        } catch (err) {
            throw new Error('subscribeToMessages: user not authenticated');
        }

        const channel = this.supabase
            .channel(key)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${convId}`
                },
                async (payload) => {
                    await this.handleDatabaseChange(payload, convId, currentUserId, onMessage);
                }
            );

        this.channels.set(key, channel);
        this.ensureSubscribed(channel, key, convId, onMessage);

        return channel;
    }

    observeMessages(convId: string): Observable<Message> {
        return new Observable<Message>((subscriber) => {
            let chan: RealtimeChannel | null = null;
            (async () => {
                try {
                    chan = await this.subscribeToMessages(convId, (msg) => {
                        try {
                            subscriber.next(msg);
                        } catch (err) {
                            console.error('[observeMessages] subscriber error', err);
                        }
                    });
                } catch (err) {
                    subscriber.error(err);
                }
            })();

            return () => {
                if (chan) this.unsubscribeChannel(chan);
            };
        });
    }

    unsubscribeChannel(channel: RealtimeChannel | null | undefined) {
        if (!channel) return;

        try {
            this.supabase.removeChannel(channel);
        } catch (err) {
            console.warn('[unsubscribeChannel] error', err);
            try {
                // @ts-ignore
                if (typeof channel.unsubscribe === 'function') channel.unsubscribe();
            } catch { }
        }

        try {
            // @ts-ignore
            const topic = channel.topic ?? channel.name ?? null;
            if (topic) {
                for (const [k, v] of this.channels.entries()) {
                    if (v === channel || k.includes(topic)) {
                        this.channels.delete(k);
                        this.pendingRetries.delete(k);
                        this.channelRetryCount.delete(k);
                    }
                }
            } else {
                for (const [k, v] of this.channels.entries()) {
                    if (v === channel) {
                        this.channels.delete(k);
                        this.pendingRetries.delete(k);
                        this.channelRetryCount.delete(k);
                    }
                }
            }
        } catch (err) {
            console.warn('[unsubscribeChannel] cleanup error', err);
        }
    }

    ngOnDestroy(): void {
        for (const ch of Array.from(this.channels.values())) {
            try {
                this.supabase.removeChannel(ch);
            } catch { }
        }
        this.channels.clear();
        this.pendingRetries.clear();
        this.channelRetryCount.clear();
        this.contactUpdates$.complete();
    }
}