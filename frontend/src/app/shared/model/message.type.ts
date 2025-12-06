export interface Message {
    id: number | string;
    from: 'me' | 'them';
    text: string;
    time?: string;     // "10:35PM" or ISO timestamp
    avatar?: string;  
}
