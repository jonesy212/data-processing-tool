import { BaseData } from '@/app/models/data/Data';
// fetchSnapshotsForCategory.ts
import internalApiService from "@/app/api/ApiClient";
import { Category } from '@/app/libraries/categories/generateCategoryProperties';
import { SnapshotsArray } from '@/app/snapshots/LocalStorageSnapshotStore';
import { StructuredMetadata } from '@/config/StructuredMetadata';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';

/**
 * Fetches snapshots for a specific category asynchronously.//+

 * @template T - Type extending BaseData//+
 * @template K - Type extending T, defaulting to T//+
 * @param {string} snapshotId - The unique identifier for the snapshot//+
 * @param {string} type - The type of snapshot to fetch//+
 * @param {Category} [category] - Optional category to filter snapshots//+
 * @returns {Promise<SnapshotsArray<T, K, Meta, ExcludedFields>>} A promise that resolves to an array of snapshots//+
 */
async function fetchSnapshotsForCategory<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>
>(
  snapshotId: string,
  type: string,
  category?: Category
): Promise<SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
  try {
    const response = await internalApiService.get<SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>(
      `/snapshots`,
      {
        params: {
          snapshotId,
          type,
          category: category ? String(category) : undefined
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Failed to fetch snapshots:', error);
    return []; // Return empty array as fallback
  }
}

export { fetchSnapshotsForCategory }