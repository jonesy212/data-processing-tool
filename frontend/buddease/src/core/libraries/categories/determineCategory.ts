// determineCategory.ts
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import { isCategoryProperties } from "@/core/libraries/categories/generateCategoryProperties";
import type { CategoryProperties } from "@/core/pages/personas/ScenarioBuilder";
import type { Snapshot } from '@/core/snapshots/Snapshot';
;

// determineCategory function
function determineCategory<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  data: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null | undefined
): string | CategoryProperties | null {
  if (!data) {
    return null; // If data is null or undefined, return null
  }

  const snapshotData = data.data; // Narrow the type of data.data
  
  if (snapshotData instanceof Map) {
    // Handle the Map case if necessary
    return null; // Adjust this based on your logic
  }

  const category = (snapshotData as T).category; // Ensure snapshotData is of type T

  if (typeof category === 'string') {
    return category; // If category is a string, return it
  } else if (isCategoryProperties(category)) {
    return category; // If category is CategoryProperties, return it
  } else {
    return null; // Return null if category is not a valid type
  }
}

export { determineCategory };
  