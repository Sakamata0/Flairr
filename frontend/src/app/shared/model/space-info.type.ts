export interface SpaceInfo {
    spacename: string;
    profileImageUrl?: string;
    bannerImageUrl?: string;
    bio?: string;
    about?: string;
    membersCount: number;
    visibility: SpaceVisibility;
}


export enum SpaceVisibility {
    PUBLIC = "public",
    PRIVATE = "private"
}
