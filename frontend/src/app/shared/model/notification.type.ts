export interface Notification {
    id: string;
    name: string;
    profileUrl?: string;
    iconUrl?: string;
    action: string;
    date: string;
    status: 'unread' | 'read';
}