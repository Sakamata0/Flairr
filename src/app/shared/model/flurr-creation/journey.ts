import { Flurr } from "./flurr";

export class Journey {
  constructor(
    public id: string,
    public username: string,
    public selectedPrivacy: string,
    public journeyName: string,
    public journeyDescription: string = "",
    public flurrs: Flurr[] = []
  ) {}
}
