import { Data } from '@/app/components/models/data/Data';
import { SchemaField } from './../database/SchemaField';
import { InitializedState } from '@/app/components/projects/DataAnalysisPhase/DataProcessing/DataStore';
import { ExtendedVersionData } from '@/app/components/versions'
// SnapshotCore.ts
interface SnapshotCore<T extends Data, K extends Data = T> {
    initialState: InitializedState<T, K>;
    schema: Record<string, SchemaField>;
    versionInfo: ExtendedVersionData | null;
    isCore: boolean;
    taskIdToAssign: string | undefined;
    // Other core properties
  }


  export type {SnapshotCore }