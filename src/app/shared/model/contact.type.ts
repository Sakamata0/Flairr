export interface Contact {
    id: number;
    name: string;
    avatar?: string; // short initials
    last?: string;
    unread?: number;
    status?: string; // online / last seen
}
