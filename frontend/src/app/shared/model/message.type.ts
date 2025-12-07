export interface Message {
  id: string;
  authorId?: string;
  authorName?: string;
  content: string;
  created_at?: string;
  from?: 'me' | 'them';
  avatar?: string;
}