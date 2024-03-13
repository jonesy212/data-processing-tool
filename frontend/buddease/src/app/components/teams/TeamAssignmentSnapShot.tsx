import { Data } from "../models/data/Data";
import Team from "../models/teams/Team";
import { Snapshot } from "../state/stores/SnapshotStore";

// Define the type for teamSnapshot
interface TeamSnapshot extends Snapshot<Data> {
  
    [teamId: string]: Team[];
  }