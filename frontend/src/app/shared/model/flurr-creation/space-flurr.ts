export class SpaceFlurr {
  constructor(
    public id: string,
    public username: string = "username_example",
    public flurrSpace: string, // from Space class
    public flurrContent: string,
    public flurrFiles?: string[]
  ) {}
}
