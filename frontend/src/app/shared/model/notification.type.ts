export interface Notification {
    id: string;  // notification_id from DB
    name: string;  // actor's name
    profileUrl?: string;  // actor's avatar
    iconUrl?: string;  // icon based on notification type
    action: string;  // content from DB
    date: string;  // created_at from DB
    status: 'unread' | 'read';  // based on read_at
    flurrId?: string;  // flurr_id from DB for navigation
    actorId?: string;  // actor_id from DB
    type: string;
}