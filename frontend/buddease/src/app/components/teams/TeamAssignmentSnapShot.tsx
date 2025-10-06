import { Snapshot } from '@/app/snapshots/Snapshot';
import { Data } from '@/app/models/data/Data';
import Team from "@/app/models/teams/Team";

// Define the type for teamSnapshot
interface TeamSnapshot extends Snapshot<Data, Data> {
  
    [teamId: string]: Team[];
  }