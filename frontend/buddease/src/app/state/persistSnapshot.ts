// persistSnapshot.ts
// app/state/snapshots/persistSnapshot.ts
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from "@/app/BaseConfig";
import { SnapshotDataType } from "@/app/snapshots";
import { DatabaseConfig } from "@/app/DatabaseConfig";
import { Attachment } from "@/app/documents/attachment/Attachment";
import { DatabaseClient } from "@/app/database/DatabaseClient";
import { sanitizeInput } from "@/app/utils/sanitizeInput";
import { notify } from "@/app/utils/notify";
import { handleApiError } from "@/app/utils/handleApiError";

export async function persistSnapshotDB<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshotData: SnapshotDataType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  config: DatabaseConfig,
  snapshotId: string,
  operationType: "insert" | "upsert" = "upsert"
): Promise<void> {
  const dbClient = new DatabaseClient(config);
  const sanitizedData = sanitizeInput(snapshotData);

  try {
    await dbClient.connect();
    if (operationType === "upsert") {
      await dbClient.upsertData("snapshots", sanitizedData);
    } else {
      await dbClient.insertData("snapshots", sanitizedData);
    }

    notify("snapshotSaveSuccess", "Snapshot saved successfully", `Snapshot ID ${snapshotId} saved`, new Date(), "SUCCESS");
  } catch (error) {
    handleApiError(error, "persistSnapshotDB");
    notify("snapshotSaveError", "Error saving snapshot", `Failed to save Snapshot ID ${snapshotId}`, new Date(), "ERROR");
    throw error;
  } finally {
    await dbClient.close();
  }
}
