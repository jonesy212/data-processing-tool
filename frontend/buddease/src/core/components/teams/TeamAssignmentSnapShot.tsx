TeamAssignmentSnapShot.tsx
import Team from "@/core/components/teams/Team";
import { Data } from '@/core/models/data/Data';
import type { Snapshot } from '@/core/snapshots/Snapshot';

// Define the type for teamSnapshot
interface TeamSnapshot extends Snapshot<Data, Data> {
  
    [teamId: string]: Team[];
  }