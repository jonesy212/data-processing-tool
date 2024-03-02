import { Data } from "../components/models/data/Data";
import DetailsListItem from "../components/models/data/DetailsListItem";
import { DetailsItem } from "../components/state/stores/DetailsListStore";


interface ListGeneratorProps<T extends Data> {
  items: DetailsItem<T>[]; // Ensure DetailsItem type is imported and defined correctly
}
const ListGenerator = <T extends Data>({ items }: ListGeneratorProps<T>) => {
  return (
    <div>
      {items.map((item, index) => ( // Removed unnecessary arguments
        <div key={index}>
          <DetailsListItem
            item={item} // Passing the item directly
            label={item.label} // Accessing label property from the item
            value={item.value} // Accessing value property from the item
          />
          {/* Render other item components or details as needed */}
        </div>
      ))}
    </div>
  );
};


export default ListGenerator;
