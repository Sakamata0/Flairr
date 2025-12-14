// ============================================
// notifications.service.ts (FIXED - Properly fetches actor data)
// ============================================
import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Notification } from '../../shared/model/notification.type';

// Simple notification from DB (without joins)
export type DBNotification = {
  notification_id: string;
  user_id: string;
  type: string;
  content: string;
  actor_id?: string;
  flurr_id?: string;
  created_at: string;
  read_at?: string | null;
};

@Injectable({ providedIn: 'root' })
export class NotificationsService {
    public supabase: SupabaseClient;
    
    private notificationsSubject = new BehaviorSubject<Notification[]>([]);
    public notifications$ = this.notificationsSubject.asObservable();
    
    private unreadCountSubject = new BehaviorSubject<number>(0);
    public unreadCount$ = this.unreadCountSubject.asObservable();

    private realtimeChannel?: RealtimeChannel;

    constructor() {
        this.supabase = createClient(
            environment.supabaseUrl, 
            environment.supabaseAnonKey
        );

        try {
            (window as any).supabase = this.supabase;
        } catch { }
    }
    
    async getUserId(): Promise<string | null> {
        const { data } = await this.supabase.auth.getUser();
        return data.user?.id ?? null;
    }

    /**
     * Get icon URL based on notification type
     */
    private getIconUrl(type: string): string {
    const iconMap: { [key: string]: string } = {
        'like': 'assets/icons/post/like.png',        
        'comment': 'assets/icons/post/comment.png',  
        'follow': 'assets/icons/panel/follow.png',
        'reply': 'assets/icons/post/comment.png'     
    };
    
    const iconPath = iconMap[type] || 'assets/icons/panel/notification.png';
    
    // Debug log to see what's being set
    console.log(`Icon for type "${type}":`, iconPath);
    
    return iconPath;
}

    /**
     * Fetch all notifications for the current user from Supabase
     * ✅ FIXED: Fetches actor data separately like your friend's code
     */
    async fetchNotifications(): Promise<Notification[]> {
        const userId = await this.getUserId();
        if (!userId) {
            console.warn('No user logged in');
            return [];
        }

        try {
            // Step 1: Get notifications (without join)
            const { data: notifs, error } = await this.supabase
                .from('notifications')
                .select('notification_id, user_id, type, content, actor_id, flurr_id, created_at, read_at')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) {
                console.error('fetchNotifications error:', error);
                return [];
            }

            if (!notifs || notifs.length === 0) {
                this.notificationsSubject.next([]);
                this.updateUnreadCount([]);
                return [];
            }

            // Step 2: Fetch actor data for each notification
            const notifications = await Promise.all(
                notifs.map(async (n: any) => {
                    let actorName = 'Someone';
                    let actorAvatar = 'assets/images/default-profile-picture.png';

                    // Fetch actor details if actor_id exists
                    if (n.actor_id) {
                        try {
                            const { data: actorRow, error: actorError } = await this.supabase
                                .from('users')
                                .select('full_name, avatar_img')
                                .eq('user_id', n.actor_id)
                                .single();

                            if (!actorError && actorRow) {
                                actorName = actorRow.full_name || 'Someone';
                                actorAvatar = actorRow.avatar_img || 'assets/images/default-profile-picture.png';
                            }
                        } catch (err) {
                            console.warn('Error fetching actor for notification:', n.notification_id, err);
                        }
                    }

                    return {
                        id: n.notification_id,
                        name: actorName,
                        profileUrl: actorAvatar,
                        iconUrl: this.getIconUrl(n.type),
                        action: n.content,
                        date: n.created_at,
                        status: n.read_at ? 'read' : 'unread',
                        flurrId: n.flurr_id,
                        actorId: n.actor_id,
                        type: n.type
                    } as Notification;
                })
            );

            this.notificationsSubject.next(notifications);
            this.updateUnreadCount(notifications);
            
            return notifications;
        } catch (err) {
            console.error('fetchNotifications unexpected error:', err);
            return [];
        }
    }

    /**
     * Mark a notification as read
     */
    async markAsRead(notificationId: string): Promise<void> {
        try {
            const { error } = await this.supabase
                .from('notifications')
                .update({ read_at: new Date().toISOString() })
                .eq('notification_id', notificationId);

            if (error) {
                console.error('markAsRead error:', error);
                return;
            }

            // Update local state
            const current = this.notificationsSubject.value;
            const updated = current.map(n => 
                n.id === notificationId 
                    ? { ...n, status: 'read' as const }
                    : n
            );
            this.notificationsSubject.next(updated);
            this.updateUnreadCount(updated);
        } catch (err) {
            console.error('markAsRead unexpected error:', err);
        }
    }

    /**
     * Mark all notifications as read
     */
    async markAllAsRead(): Promise<void> {
        const userId = await this.getUserId();
        if (!userId) return;

        try {
            const { error } = await this.supabase
                .from('notifications')
                .update({ read_at: new Date().toISOString() })
                .eq('user_id', userId)
                .is('read_at', null);

            if (error) {
                console.error('markAllAsRead error:', error);
                return;
            }

            // Refresh notifications
            await this.fetchNotifications();
        } catch (err) {
            console.error('markAllAsRead unexpected error:', err);
        }
    }

    /**
     * Delete a notification
     */
    async deleteNotification(notificationId: string): Promise<void> {
        try {
            const { error } = await this.supabase
                .from('notifications')
                .delete()
                .eq('notification_id', notificationId);

            if (error) {
                console.error('deleteNotification error:', error);
                return;
            }

            // Update local state
            const current = this.notificationsSubject.value;
            const updated = current.filter(n => n.id !== notificationId);
            this.notificationsSubject.next(updated);
            this.updateUnreadCount(updated);
        } catch (err) {
            console.error('deleteNotification unexpected error:', err);
        }
    }

    /**
     * Subscribe to real-time notifications
     */
    subscribeToNotifications(userId: string): RealtimeChannel {
        // Unsubscribe from previous channel if exists
        if (this.realtimeChannel) {
            this.realtimeChannel.unsubscribe();
        }

        this.realtimeChannel = this.supabase
            .channel('notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`
                },
                async (payload) => {
                    console.log('New notification received:', payload);
                    // Refresh notifications when a new one arrives
                    await this.fetchNotifications();
                }
            )
            .subscribe();

        return this.realtimeChannel;
    }

    /**
     * Unsubscribe from real-time notifications
     */
    unsubscribeFromNotifications(): void {
        if (this.realtimeChannel) {
            this.realtimeChannel.unsubscribe();
            this.realtimeChannel = undefined;
        }
    }

    /**
     * Update the unread count based on current notifications
     */
    private updateUnreadCount(notifications: Notification[]): void {
        const unreadCount = notifications.filter(n => n.status === 'unread').length;
        this.unreadCountSubject.next(unreadCount);
    }

    /**
     * Get unread count from database
     */
    async getUnreadCount(): Promise<number> {
        const userId = await this.getUserId();
        if (!userId) return 0;

        try {
            const { count, error } = await this.supabase
                .from('notifications')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .is('read_at', null);

            if (error) {
                console.error('getUnreadCount error:', error);
                return 0;
            }

            return count ?? 0;
        } catch (err) {
            console.error('getUnreadCount unexpected error:', err);
            return 0;
        }
    }
}