import { UnifiedMetaDataOptions } from '@/app/configs/database/MetaDataOptions';
import { Data } from '@/app/components/models/data/Data';
import { InitializedState } from '@/app/components/projects/DataAnalysisPhase/DataProcessing/DataStore';
import { ExtendedVersionData } from '@/app/components/versions';
import { SchemaField } from './../database/SchemaField';
// SnapshotCore.ts
interface SnapshotCore<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T> {
    initialState: InitializedState<T, Meta, K>;
    schema: Record<string, SchemaField>;
    versionInfo: ExtendedVersionData | null;
    isCore: boolean;
    taskIdToAssign: string | undefined;
    // Other core properties
  }


  export type { SnapshotCore };
