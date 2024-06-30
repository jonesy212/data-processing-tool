import React from "react";
import { Data } from "../components/models/data/Data";
import DetailsListItem, { AllProperties } from "../components/models/data/DetailsListItem";
import { DetailsItem } from "../components/state/stores/DetailsListStore";


// Define a new type for DetailsItem with optional properties
type DetailsItemCommon<T> = DetailsItem<Partial<AllProperties>>;

interface ListGeneratorProps<T extends Data, U> {
  items: DetailsItemCommon<T>[]; // Use DetailsItemCommon type
  onItemClick?: (contentItemId: DetailsItemCommon<T>, tracker: U) => void; // Accept both contentItemId and tracker
  
}

const ListGenerator = <T extends Data, U>({ items, onItemClick }: ListGeneratorProps<T, U>) => {

    // Add handleContentItemClick function to handle item click
    const handleContentItemClick = (contentItem: DetailsItemCommon<T>, tracker: U) => {
      onItemClick && onItemClick(contentItem, tracker); // Call onItemClick callback with contentItem
    };
  
  return (
    <div>
    {items.map((item, index) => (
      <div key={index} onClick={() => handleContentItemClick(item, item.tracker)}> {/* Pass tracker as needed */}
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

