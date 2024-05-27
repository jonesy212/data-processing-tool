// snapshotUtils.tsx
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import useNotification from "antd/es/notification/useNotification";

export const generateSnapshotId = UniqueIDGenerator.generateSnapshotID();
export const notify = useNotification();
