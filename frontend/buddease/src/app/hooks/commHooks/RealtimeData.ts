// RealtimeDataComponent.tsx
import { ExchangeActions } from "@/app/actions/ExchangeActions";
import { ExchangeData } from "@/app/models/data/ExchangeData";
import useRealtimeData, { RealtimeUpdateCallback } from "@/app/hooks/commHooks/useRealtimeData";
import useErrorHandling from "@/app/hooks/useErrorHandling";
import { fetchDEXData } from "@/app/models/data/fetchExchangeData";
import { RealtimeData, RealtimeDataItem } from "@/app/models/realtime/RealtimeData"; // Adjust path as needed
import SnapshotStore from "@/app/snapshots/SnapshotStore";
import React, { useEffect } from "react";
import { BaseDataEntity, DefaultMeta, Attachment, DefaultExcludedFields } from '@/app/config/BaseConfig'

interface RealtimeDataProps extends RealtimeDataItem  {
  userId: string;
  dispatch: (action: any) => void;
  value: string;
}

const processSnapshotStore = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T>(
  snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
) => {
  Object.keys(snapshotStore).forEach((snapshotId) => {
    const typedSnapshotId = snapshotId as keyof SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    const snapshotData = snapshotStore[typedSnapshotId];
    console.log(`Processing snapshot with ID ${String(typedSnapshotId)}:`, snapshotData);
  });
};


export type { processSnapshotStore, RealtimeDataProps };

