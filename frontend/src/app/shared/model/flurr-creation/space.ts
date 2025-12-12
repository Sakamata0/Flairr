export class Space {
  constructor(
    public id: string,
    public username: string = "username_example",
    public selectedPrivacy: string = "public",
    public spaceName: string = "",
    public spaceInvitations?: string,
  ) {}
}
