import { CommentNode } from "../../components/post-components/comment-tree/comment-tree";
import { MediaItem } from "./media-item.type";

export interface PostInfo {
  id: string;
  title?: string;
  author: { id: string; name: string; avatarUrl?: string; title?: string; isFollowed?: boolean; isBlocked?: boolean };
  content?: string;
  media?: MediaItem[];
  externalUrl?: string;
  externalTitle?: string;
  reactions?: Record<string, number>;
  commentsCount?: number;
  viewsCount?: number;
  createdAt?: string | Date;
  userHasLiked?: boolean;
  isHidden?: boolean;
  isReported?: boolean;
  comments ?: CommentNode[];
}