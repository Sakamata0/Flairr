export interface Contact {
    id: string; // user_id
    conversationId?: string; // <-- important
    name: string;
    avatar?: string | null;
    lastMessage?: string | null;
    unreadCount?: number;
    lastAt?: string | Date | null;
    online?: boolean;
}