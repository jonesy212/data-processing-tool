import { Data } from "../models/data/Data";
import Team from "../models/teams/Team";
import { Snapshot } from "../snapshots/SnapshotStore";

// Define the type for teamSnapshot
interface TeamSnapshot extends Snapshot<Data, Data> {
  
    [teamId: string]: Team[];
  }