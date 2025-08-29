// import { Data } from "../models/data/Data";
// import { Snapshot } from "@/app/components/snapshots";
// import { SnapshotItem } from "./SnapshotList";

// // convertSnapshotToItem.ts
// function convertSnapshotToItem<T extends  BaseData<any>, K extends T = T, Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>>(
//   snapshot: Snapshot<T, K>,
//   id: string
// ): SnapshotItem<T, K> {
//   return {
//     id,
//     user: snapshot.user,
//     label: snapshot.label,
//     data: snapshot.data ?? new Map<string, Snapshot<T, K>>(),
//     metadata: snapshot.metadata,
//     message: snapshot.message,
//     value: snapshot.value,
//     category: snapshot.category,
//     timestamp: snapshot.timestamp,
//     type: snapshot.type,
//     status: snapshot.status,
//   };
// }
