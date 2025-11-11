export interface MediaItem {
  id?: string;
  url: string;
  type: 'image' | 'video';
  mime?: string;
  thumbnailUrl?: string;
  filename?: string;
}