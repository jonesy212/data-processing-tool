// RealtimeDataComponent.tsx
import { ExchangeActions } from "@/app/actions/ExchangeActions";
import { ExchangeData } from "@/app/models/data/ExchangeData";
import useRealtimeData, { RealtimeUpdateCallback } from "@/app/hooks/commHooks/useRealtimeData";
import useErrorHandling from "@/app/hooks/useErrorHandling";
import { fetchDEXData } from "@/app/models/data/fetchExchangeData";
import { RealtimeDataItem } from "@/app/typings/realtimeTypes"; // Adjust path as needed
import SnapshotStore from "@/app/snapshots/SnapshotStore";
import React, { useEffect } from "react";
import { BaseDataEntity, DefaultMeta, DefaultExcludedFields } from '@/app/config/BaseConfig'
import { Attachment } from "@/app/documents/attachment/Attachment";

import { RealtimeDataItem } from "@/app/typings/realtimeTypes"; // Adjust path as needed



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


export type { processSnapshotStore };

