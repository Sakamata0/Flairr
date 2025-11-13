export interface Message {
    id?: string | number;
    from: 'me' | 'them';
    text: string;
    time?: string;
}
