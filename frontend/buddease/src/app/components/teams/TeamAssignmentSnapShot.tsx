import { Team } from "../models/teams/Team";

// Define the type for teamSnapshot
interface TeamSnapshot extends Snapshot<Data> {
    [teamId: string]: Team[];
  }