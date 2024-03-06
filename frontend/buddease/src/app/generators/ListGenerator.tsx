import { Data } from "../components/models/data/Data";
import DetailsListItem from "../components/models/data/DetailsListItem";
import { DetailsItem } from "../components/state/stores/DetailsListStore";


interface ListGeneratorProps<T extends Data> {
  items: DetailsItem<T>[]; // Ensure DetailsItem type is imported and defined correctly
  
}
const ListGenerator = <T extends Data>({ items }: ListGeneratorProps<T>) => {
  return (
    <div>
    {items.map((item, index) => (
      <div key={index}>
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
