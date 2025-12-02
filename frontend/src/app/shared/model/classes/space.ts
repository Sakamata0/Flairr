export class Space {

  // ---- Private attributes ----
  private spaceID: string;
  private spaceName: string;
  private spaceBio: string;
  private avatarImg: string;
  private coverImg: string;
  private dateCreated: Date;
  private members: string[];
  private ownerID?: string;
  private collaborators: string[];
  private fluurs: string[];

  // ---- Constructor ----
  constructor(params: {
    spaceID: string;
    spaceName: string;
    spaceBio: string;
    avatarImg: string;
    coverImg: string;
    dateCreated: Date;
    members?: string[];
    ownerID?: string;
    collaborators?: string[];
    fluurs?: string[];
  }) {
    this.spaceID = params.spaceID;
    this.spaceName = params.spaceName;
    this.spaceBio = params.spaceBio;
    this.avatarImg = params.avatarImg;
    this.coverImg = params.coverImg;
    this.dateCreated = params.dateCreated;
    this.members = params.members ?? [];
    this.ownerID = params.ownerID;
    this.collaborators = params.collaborators ?? [];
    this.fluurs = params.fluurs ?? [];
  }

  // ---- Getters ----
  getSpaceID() { return this.spaceID; }
  getSpaceName() { return this.spaceName; }
  getSpaceBio() { return this.spaceBio; }
  getAvatarImg() { return this.avatarImg; }
  getCoverImg() { return this.coverImg; }
  getDateCreated() { return this.dateCreated; }
  getMembers() { return this.members; }
  getOwnerID() { return this.ownerID; }
  getCollaborators() { return this.collaborators; }
  getFluurs() { return this.fluurs; }

  // ---- Setters ----
  setSpaceName(name: string) { this.spaceName = name; }
  setSpaceBio(bio: string) { this.spaceBio = bio; }
  setAvatarImg(url: string) { this.avatarImg = url; }
  setCoverImg(url: string) { this.coverImg = url; }
  setOwnerID(id: string) { this.ownerID = id; }

  // ---- Methods ----
  addMember(userID: string) {
    if (!this.members.includes(userID)) this.members.push(userID);
  }

  addCollaborator(userID: string) {
    if (!this.collaborators.includes(userID)) this.collaborators.push(userID);
  }

  addFlurr(flurrID: string) {
    this.fluurs.push(flurrID);
  }

  // Returns a plain object (DTO)
  getSpace() {
    return {
      spaceID: this.spaceID,
      spaceName: this.spaceName,
      spaceBio: this.spaceBio,
      avatarImg: this.avatarImg,
      coverImg: this.coverImg,
      dateCreated: this.dateCreated,
      members: [...this.members],
      ownerID: this.ownerID,
      collaborators: [...this.collaborators],
      fluurs: [...this.fluurs]
    };
  }
}
