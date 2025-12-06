export interface ItemPanelInfo {
    // general info
    id: string;
    title: string;
    imageUrl: string;

    // for subtitle
    withSubtitle: boolean;
    subtitle?: string;
    subtitleOnSameLevel?: boolean;

    // For icons that accompany the title
    withIcon: boolean;
    iconUrl?: string;

    // For a button that accompanies the panel
    withButton: boolean;
    buttonText?: string;
    buttonAction?: () => void;
}