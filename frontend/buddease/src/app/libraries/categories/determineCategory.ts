// determinCategory.ts
import { BaseData } from '@/app/models/data/Data';
import { Snapshot } from "@/app/snapshots/Snapshot";
import { StructuredMetadata } from '@/config/StructuredMetadata';
import { CategoryProperties } from "@/app/pages/personas/ScenarioBuilder";
import { isCategoryProperties } from "@/app/libraries/categories/generateCategoryProperties";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';

// determineCategory function
function determineCategory<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>,
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
  