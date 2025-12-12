
-- Users
CREATE TABLE IF NOT EXISTS users (
  user_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text,
  email text UNIQUE,
  hashed_password text,
  bio text,
  avatar_img text,
  cover_img text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Journeys
CREATE TABLE IF NOT EXISTS journeys (
  journey_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_name text NOT NULL,
  date_creation timestamptz DEFAULT now(),
  user_id uuid NOT NULL,
  CONSTRAINT fk_journeys_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Spaces
CREATE TABLE IF NOT EXISTS spaces (
  space_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  space_name text NOT NULL,
  space_bio text,
  avatar_img text,
  cover_img text,
  space_owner uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT fk_spaces_owner FOREIGN KEY (space_owner) REFERENCES users(user_id) ON DELETE SET NULL
);

-- Join-spaces (join table between users and spaces)
CREATE TABLE IF NOT EXISTS join_spaces (
  user_id uuid NOT NULL,
  space_id uuid NOT NULL,
  joined_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, space_id),
  CONSTRAINT fk_join_spaces_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_join_spaces_space FOREIGN KEY (space_id) REFERENCES spaces(space_id) ON DELETE CASCADE
);

-- Flurrs
CREATE TABLE IF NOT EXISTS flurrs (
  flurr_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text,
  content text,
  date_publish timestamptz DEFAULT now(),
  journey_id uuid,
  space_id uuid,
  poster_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT fk_flurrs_journey FOREIGN KEY (journey_id) REFERENCES journeys(journey_id) ON DELETE SET NULL,
  CONSTRAINT fk_flurrs_space FOREIGN KEY (space_id) REFERENCES spaces(space_id) ON DELETE SET NULL,
  CONSTRAINT fk_flurrs_poster FOREIGN KEY (poster_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Flurr-files
-- link_id kept as text (could be storage path or url)
CREATE TABLE IF NOT EXISTS flurr_files (
  flurr_id uuid NOT NULL,
  link_url text NOT NULL,
  type text,
  created_at timestamptz DEFAULT now(),

  -- Composite primary key
  PRIMARY KEY (flurr_id, link_url),

  -- Foreign key
  CONSTRAINT fk_flurr_files_flurr
    FOREIGN KEY (flurr_id) REFERENCES flurrs(flurr_id) ON DELETE CASCADE
);

-- Comments
CREATE TABLE IF NOT EXISTS comments (
  comment_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  suprerior_comment_id uuid, -- parent comment (nullable)
  user_id uuid,              -- author of the comment (nullable if you want)
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT fk_comments_parent FOREIGN KEY (suprerior_comment_id) REFERENCES comments(comment_id) ON DELETE CASCADE,
  CONSTRAINT fk_comments_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

/*-- Flurr-action
-- this table in your original schema mixed likes/comments; we keep fields provided
CREATE TABLE IF NOT EXISTS flurr_action (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  flurr_id uuid,
  comment_id uuid, -- could reference comments.comment_id (nullable)
  is_liked boolean DEFAULT false,
  acted_at timestamptz DEFAULT now(),
  CONSTRAINT fk_flurr_action_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_flurr_action_flurr FOREIGN KEY (flurr_id) REFERENCES flurrs(flurr_id) ON DELETE CASCADE,
  CONSTRAINT fk_flurr_action_comment FOREIGN KEY (comment_id) REFERENCES comments(comment_id) ON DELETE CASCADE
);*/

CREATE TABLE IF NOT EXISTS likes (
  user_id uuid NOT NULL,
  flurr_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, flurr_id),
  CONSTRAINT fk_likes_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_likes_flurr FOREIGN KEY (flurr_id) REFERENCES flurrs(flurr_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS comment_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,            -- actor who performed the action
  flurr_id uuid,                    -- optional link to the flurr
  comment_id uuid,                  -- optional link to the comment
  action_type text NOT NULL,        -- e.g. 'report', 'pin', 'flag', 'bookmark'
  action_meta jsonb,                -- extra data for the action
  created_at timestamptz DEFAULT now(),

  CONSTRAINT fk_comment_actions_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_comment_actions_flurr FOREIGN KEY (flurr_id) REFERENCES flurrs(flurr_id) ON DELETE CASCADE,
  CONSTRAINT fk_comment_actions_comment FOREIGN KEY (comment_id) REFERENCES comments(comment_id) ON DELETE CASCADE
);

-- Request-follow
CREATE TABLE IF NOT EXISTS request_follow (
  requester_id uuid NOT NULL,
  requested_id uuid NOT NULL,
  status text, -- e.g. 'pending','accepted','rejected'
  date_request timestamptz DEFAULT now(),
  responded_at timestamptz,

  -- Composite primary key
  PRIMARY KEY (requester_id, requested_id),

  -- Foreign keys
  CONSTRAINT fk_request_follow_requester
    FOREIGN KEY (requester_id) REFERENCES users(user_id) ON DELETE CASCADE,

  CONSTRAINT fk_request_follow_requested
    FOREIGN KEY (requested_id) REFERENCES users(user_id) ON DELETE CASCADE
);


-- Friends (followers)
CREATE TABLE IF NOT EXISTS friends (
  follower_id uuid NOT NULL,
  followed_id uuid NOT NULL,
  date_follow timestamptz DEFAULT now(),
  PRIMARY KEY (follower_id, followed_id),
  CONSTRAINT fk_friends_follower FOREIGN KEY (follower_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_friends_followed FOREIGN KEY (followed_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Messages (main message table)
CREATE TABLE IF NOT EXISTS messages (
  message_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text,
  date_msg timestamptz DEFAULT now(),
  status text  -- e.g. 'sent','delivered','read'
);

-- Texte-msg (mapping between sender/receiver and message)
CREATE TABLE IF NOT EXISTS texte_msg (
  sender_id uuid NOT NULL,
  receiver_id uuid NOT NULL,
  msg_id uuid NOT NULL,
  sent_at timestamptz DEFAULT now(),
  PRIMARY KEY (sender_id, receiver_id, msg_id),
  CONSTRAINT fk_texte_msg_sender FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_texte_msg_receiver FOREIGN KEY (receiver_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_texte_msg_message FOREIGN KEY (msg_id) REFERENCES messages(message_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notifications (
  notification_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  user_id uuid NOT NULL,          -- who receives the notification
  actor_id uuid,                  -- who triggered it (nullable)
  
  type text NOT NULL,             -- e.g., 'like', 'comment', 'follow', 'request_accepted', 'message'
  content text,                   -- short text like "John liked your flurr"
  
  flurr_id uuid,                  -- optional (for like/comment)
  comment_id uuid,                -- optional (linked comment)
  request_id uuid,                -- optional (follow request)
  message_id uuid,                -- optional (message notif)
  
  status text DEFAULT 'unread',   -- 'unread' or 'read'
  
  created_at timestamptz DEFAULT now(),

  -- Foreign keys
  CONSTRAINT fk_notifications_user
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,

  CONSTRAINT fk_notifications_actor
    FOREIGN KEY (actor_id) REFERENCES users(user_id) ON DELETE SET NULL,

  CONSTRAINT fk_notifications_flurr
    FOREIGN KEY (flurr_id) REFERENCES flurrs(flurr_id) ON DELETE SET NULL,

  CONSTRAINT fk_notifications_comment
    FOREIGN KEY (comment_id) REFERENCES comments(comment_id) ON DELETE SET NULL,

  CONSTRAINT fk_notifications_request
    FOREIGN KEY (request_id) REFERENCES request_follow(id) ON DELETE SET NULL,

  CONSTRAINT fk_notifications_message
    FOREIGN KEY (message_id) REFERENCES messages(message_id) ON DELETE SET NULL
);
