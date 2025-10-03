import { BaseData } from '@/app/components/models/data/Data';
import DetailsListItem, { AllProperties } from "@/app/components/models/data/DetailsListItem";
import { DetailsItem } from "@/app/state/stores/DetailsListStore";
import { StructuredMetadata } from "@/config/StructuredMetadata";

// Define a new type for DetailsItem with optional properties
type DetailsItemCommon<T extends BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>> = DetailsItem<Partial<AllProperties<T, K>>>;

interface ListGeneratorProps<
  T extends BaseData<any>,
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>
> {
  items: DetailsItemCommon<T, K>[]; // Use DetailsItemCommon type
  onItemClick?: (contentItemId: DetailsItemCommon<T, K>, tracker: K) => void; // Accept both contentItemId and tracker (K instead of U)
}

const ListGenerator = <
  T extends BaseData<any>, 
K extends T = T, 
Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>
>({
  items,
  onItemClick,
}: ListGeneratorProps<T, K, Meta>) => {
  // Add handleContentItemClick function to handle item click
  const handleContentItemClick = (contentItem: DetailsItemCommon<T, K>, tracker: K) => {
    onItemClick && onItemClick(contentItem, tracker); // Call onItemClick callback with contentItem
  };

  return (
    <div>
    {items.map((item, index) => {
      // Ensure label is a string
      const label = item.label ? item.label.toString() : '';

      // Ensure value is a string (you might need to adjust this based on your actual data structure)
      const value = item.value ? item.value.toString() : '';

      return (
        <div key={index} onClick={() => item.tracker && handleContentItemClick(item, item.tracker as unknown as K)}>
          {/* Check if label and value are defined before passing them */}
          {label && value && (
            <DetailsListItem
              item={item}
              label={label}
              value={value}
            />
          )}
          {/* Render other item components or details as needed */}
        </div>
      );
    })}
  </div>
  );
};

export default ListGenerator;
export type { DetailsItemCommon, ListGeneratorProps };
