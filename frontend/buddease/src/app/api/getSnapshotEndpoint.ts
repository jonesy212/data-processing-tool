import { BaseData } from '@/app/models/data/Data';
import { Snapshots } from '@/app/snapshots/LocalStorageSnapshotStore';
import endpointConfigurations, { EndpointConfig } from "./endpointConfigurations";
import { BaseDataEntity, DefaultMeta, DefaultExcludedFields } from '@/config/BaseConfig';

type SnapshotCategoryType = "User" | "Todo" | "Task" | "Delegate" | "Highlight" |  "Project" |
    "Note" |
    "Comment";

interface SnapshotCategory<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
    id: string;
    name: SnapshotCategoryType;
    description?: string;
    snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
}

// Update your function to accept SnapshotCategoryType
function getSnapshotEndpoint(snapshotCategory: SnapshotCategoryType, snapshotId?: string | number): string | EndpointConfig {
    switch (snapshotCategory) {
        case "User":
            return endpointConfigurations.users.single(Number(snapshotId));
        case "Todo":
            return endpointConfigurations.todos.single(Number(snapshotId));
        case "Task":
            return endpointConfigurations.tasks.single(Number(snapshotId));
        case "Delegate":
            return endpointConfigurations.delegates.single(Number(snapshotId));
        case "Highlight":
            return endpointConfigurations.highlights.getSpecific;
        case "Project":
            return endpointConfigurations.projects.single(Number(snapshotId));
        case "Note":
            return endpointConfigurations.news.single(Number(snapshotId));
        case "Comment":
            return endpointConfigurations.comments.single(Number(snapshotId));
        // Add more cases for new categories
        default:
            throw new Error(`Unknown SnapshotCategory: ${snapshotCategory}`);
    }
}


export type { SnapshotCategory, SnapshotCategoryType };

    export { getSnapshotEndpoint };

