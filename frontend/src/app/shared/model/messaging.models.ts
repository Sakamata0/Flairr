// src/app/models/messaging.models.ts

// -----------------------------
// UI models 
// -----------------------------
export interface Contact {
  id: string;
  name: string;
  conversationId?: string; 
  avatar?: string | null;
  lastMessage?: string | null;
  unreadCount?: number;
  lastAt?: string | Date | null;
  online?: boolean;
}

/**
 * Message model used by chat view template.
 */
export interface Message {
  id: string;
  conversation_id?: string; // optional, useful internally
  authorId?: string;        // maps to messages.author_id
  authorName?: string;      // from users.full_name
  content: string;
  created_at?: string;      // ISO timestamp string (maps to messages.created_at)
  from?: 'me' | 'them';     // computed on client (authorId === currentUserId ? 'me' : 'them')
  avatar?: string;          // author's avatar (users.avatar_img)
}

// Optional enriched message with author object
export interface MessageWithAuthor extends Message {
  author?: {
    id: string;
    fullName?: string;
    avatarImg?: string;
  };
}

// Conversation model (minimal) — stored in DB as conversations.id
export interface Conversation {
  id: string;
  created_at?: string;
}

// Participant model (minimal)
export interface Participant {
  id: string;
  conversation_id: string;
  user_id: string;
}

// -----------------------------
// DB row types (snake_case) — match exactly what Postgres / Supabase returns
// -----------------------------
export type DbUserRow = {
  user_id: string;
  full_name?: string | null;
  email?: string | null;
  avatar_img?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type DbConversationRow = {
  id: string;
  created_at?: string | null;
};

export type DbParticipantRow = {
  id: string;
  conversation_id: string;
  user_id: string;
};

export type DbMessageRow = {
  id: string;
  conversation_id: string;
  author_id: string;
  content: string;
  created_at?: string | null;
};

// -----------------------------
// Mapper helpers: DB row -> UI model
// -----------------------------
/**
 * Map a raw messages row (DbMessageRow) + optional author row into a UI Message.
 * - Keeps created_at as ISO string (or null)
 * - Sets authorId and authorName and avatar from DbUserRow if provided
 * - Computes `from` relative to currentUserId if provided
 */
export function mapDbMessageToUI(
  row: DbMessageRow,
  author?: DbUserRow | null,
  currentUserId?: string
): Message {
  const authorId = row.author_id;
  const createdAt = row.created_at ?? new Date().toISOString();

  const ui: Message = {
    id: row.id,
    conversation_id: row.conversation_id,
    authorId,
    authorName: author?.full_name ?? undefined,
    content: row.content,
    created_at: createdAt,
    from: currentUserId ? (authorId === currentUserId ? 'me' : 'them') : undefined,
    avatar: author?.avatar_img ?? undefined
  };

  return ui;
}

/**
 * Build a Contact UI model for a conversation.
 *
 * Usage notes:
 * - otherUser: the user row representing the **other** participant in the conversation (not current user)
 * - lastMsg: last message row for the conversation (nullable)
 * - unreadCount: optional numeric value you compute elsewhere
 */
export function mapToContactFromConversation(
  conversation: DbConversationRow,
  otherUser: DbUserRow,
  lastMsg?: DbMessageRow | null,
  unreadCount = 0
): Contact {
  return {
    id: otherUser.user_id,
    name: otherUser.full_name ?? otherUser.user_id,
    avatar: otherUser.avatar_img ?? null,
    lastMessage: lastMsg?.content ?? null,
    unreadCount,
    lastAt: lastMsg?.created_at ?? null,
    online: false
  };
}

/**
 * If you ever need a Contact that stores conversation_id (useful when contact.id is user_id),
 * you can attach conversation_id to the Contact object like this:
 */
export function mapToContactWithConv(
  conversation: DbConversationRow,
  otherUser: DbUserRow,
  lastMsg?: DbMessageRow | null,
  unreadCount = 0
): Contact & { conversationId: string } {
  return {
    ...mapToContactFromConversation(conversation, otherUser, lastMsg, unreadCount),
    conversationId: conversation.id
  };
}
