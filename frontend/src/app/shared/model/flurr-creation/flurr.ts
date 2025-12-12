export class Flurr {
  constructor(
    public id: string,
    public username: string = "username_example",
    public selectedPrivacy: string = "public",
    public selectedJourney: string = "",
    public flurrContent: string = "",
    public flurrFiles?: string[]
  ) {}
}
