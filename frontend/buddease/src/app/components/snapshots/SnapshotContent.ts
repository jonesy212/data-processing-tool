import { SnapshotData } from ".";
import { ContentItem } from "../cards/DummyCardLoader";
import { BaseData } from "../models/data/Data";
import { Snapshot } from "./LocalStorageSnapshotStore";

export interface SnapshotContent<T extends BaseData, K extends BaseData> extends ContentItem {
  snapshot: Snapshot<T, K>;
  snapshotData: SnapshotData<T, K>;
}
