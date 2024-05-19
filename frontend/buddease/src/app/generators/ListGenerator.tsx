import { Data } from "../components/models/data/Data";
import DetailsListItem, { AllProperties } from "../components/models/data/DetailsListItem";
import { DetailsItem } from "../components/state/stores/DetailsListStore";


// Define a new type for DetailsItem with optional properties
type DetailsItemCommon<T> = DetailsItem<Partial<AllProperties>>;

interface ListGeneratorProps<T extends Data> {
  items: DetailsItemCommon<T>[]; // Use DetailsItemCommon type
  onItemClick?: (contentItemId: DetailsItemCommon<Data>) => void
}

const ListGenerator = <T extends Data>({ items, onItemClick }: ListGeneratorProps<T>) => {

    // Add handleContentItemClick function to handle item click
    const handleContentItemClick = (contentItem: DetailsItemCommon<T>) => {
      onItemClick && onItemClick(contentItem); // Call onItemClick callback with contentItem
    };
  
  return (
    <div>
      {items.map((item, index) => (
        <div key={index} onClick={() => handleContentItemClick(item)}> {/* Attach onClick handler */}
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

