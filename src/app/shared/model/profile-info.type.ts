export interface profileInfo {
    username: string;
    profileImageUrl?: string;
    bannerImageUrl?: string;
    bio?: string;
    followersCount: number;
    followingCount: number;
    postsCount: number;
    birthday?: Date;
    country?: string;
}