export class Journey {

  // ---- Private attributes ----
  private journeyID: string;
  private journeyName: string;
  private privacy: "public" | "private" | "friends";
  private dateCreated: Date;
  private fluurs: string[];
  private ownerID?: string;
  private journeyDescription?: string

  // ---- Constructor with param object ----
  constructor(params: {
    journeyID: string;
    journeyName: string;
    privacy: "public" | "private" | "friends"; 
    dateCreated: Date;
    journeyDescription?: string;
    fluurs?: string[];
    ownerID?: string;
  }) {
    this.journeyID = params.journeyID;
    this.journeyName = params.journeyName;
    this.dateCreated = params.dateCreated;
    this.privacy = params.privacy;
    this.journeyDescription = params.journeyDescription;
    this.fluurs = params.fluurs ?? [];
    this.ownerID = params.ownerID;
  }

  // ---- Getters ----
  getJourneyID() { return this.journeyID; }
  getJourneyName() { return this.journeyName; }
  getDateCreated() { return this.dateCreated; }
  getFluurs() { return this.fluurs; }
  getOwnerID() { return this.ownerID; }
  getPrivacy() { return this.privacy; }

  // ---- Setters ----
  setJourneyName(name: string) { this.journeyName = name; }
  setOwnerID(id: string) { this.ownerID = id; }

  // ---- Methods ----
  addFlurr(flurrID: string) {
    this.fluurs.push(flurrID);
  }

  getJourney() {
    return {
      journeyID: this.journeyID,
      journeyName: this.journeyName,
      journeyDescription: this.journeyDescription,
      dateCreated: this.dateCreated,
      fluurs: [...this.fluurs],
      ownerID: this.ownerID
    };
  }
}
