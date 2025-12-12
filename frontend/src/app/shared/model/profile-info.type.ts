export interface profileInfo {
    username: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
    bannerImageUrl?: string;
    bio?: string;
    followersCount: number;
    followingCount: number;
    postsCount: number;
    birthdate?: string;
    country?: string;
    email?: string;
}
