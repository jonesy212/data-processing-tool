import { BaseData } from '@/app/components/models/data/Data';
import DetailsListItem, { AllProperties } from "../components/models/data/DetailsListItem";
import { DetailsItem } from "../components/state/stores/DetailsListStore";
import { StructuredMetadata } from "../configs/StructuredMetadata";

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
      {items.map((item, index) => (
        <div key={index} onClick={() => item.tracker && handleContentItemClick(item, item.tracker as unknown as K)}>
          {/* Check if label and value are defined before passing them */}
          {item.label !== undefined && item.value !== undefined && (
            <DetailsListItem
              item={item}
              label={item.label}
              value={item.value}
            />
          )}
          {/* Render other item components or details as needed */}
        </div>
      ))}
    </div>
  );
};

export default ListGenerator;
export type { DetailsItemCommon, ListGeneratorProps };
