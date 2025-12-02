export class Flurr {

  // ---- Private attributes ----
  private flurrID: string;
  private type: "journey" | "space";
  private content: string;
  private privacy: "public" | "private" | "friends";
  private datePosted: Date;
  private journeyID?: string;
  private spaceID?: string;
  private likes: string[];
  private comments: string[];

  // ---- Constructor with clean object ----
  constructor(params: {
    flurrID: string;
    type: "journey" | "space";
    content: string;
    privacy: "public" | "private" | "friends";
    datePosted: Date;
    journeyID?: string;
    spaceID?: string;
    likes?: string[]; // kn thbou type number , aadi baddl !!!
    comments?: string[];
  }) {
    this.flurrID = params.flurrID;
    this.type = params.type;
    this.content = params.content;
    this.privacy = params.privacy;
    this.datePosted = params.datePosted;
    this.journeyID = params.journeyID;
    this.spaceID = params.spaceID;
    this.likes = params.likes ?? [];
    this.comments = params.comments ?? [];
  }

  // ---- Public getters ----
  getFlurrID() { return this.flurrID; }
  getType() { return this.type; }
  getContent() { return this.content; }
  getPrivacy() { return this.privacy; }
  getDatePosted() { return this.datePosted; }
  getJourneyID() { return this.journeyID; }
  getSpaceID() { return this.spaceID; }
  getLikes() { return this.likes; }
  getComments() { return this.comments; }

  // ---- Setters ----
  setContent(content: string) { this.content = content; }
  setPrivacy(p: "public" | "private" | "friends") { this.privacy = p; }

  // Return as pure data object
  getFlurr() {
    return {
      flurrID: this.flurrID,
      type: this.type,
      content: this.content,
      privacy: this.privacy,
      datePosted: this.datePosted,
      journeyID: this.journeyID,
      spaceID: this.spaceID,
      likes: [...this.likes],
      comments: [...this.comments]
    };
  }
}
