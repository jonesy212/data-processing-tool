import DetailsListItem from "../components/models/data/DetailsListItem";
import { DetailsItem } from "../components/state/stores/DetailsListStore";

interface ListGeneratorProps<T> {
  items: DetailsItem<T>[]; // Ensure DetailsItem type is imported and defined correctly
}

const ListGenerator = <T,>({ items }: ListGeneratorProps<T>) => { // Added comma after <T,
  return (
    <div>
      {items.map((item, index) => (
        <div key={index}>
          <DetailsListItem item={item} />
          {/* Render other item components or details as needed */}
        </div>
      ))}
    </div>
  );
};

export default ListGenerator;
