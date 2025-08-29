import { Snapshot } from "@/app/components/snapshots";
import { Data } from "../models/data/Data";
import Team from "../models/teams/Team";

// Define the type for teamSnapshot
interface TeamSnapshot extends Snapshot<Data, Data> {
  
    [teamId: string]: Team[];
  }