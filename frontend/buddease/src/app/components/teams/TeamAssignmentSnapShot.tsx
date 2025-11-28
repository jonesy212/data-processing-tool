// TeamAssignmentSnapShot.tsx
import Team from "@/app/components/teams/Team";
import { Data } from '@/app/models/data/Data';
import { Snapshot } from '@/app/snapshots/Snapshot';

// Define the type for teamSnapshot
interface TeamSnapshot extends Snapshot<Data, Data> {
  
    [teamId: string]: Team[];
  }