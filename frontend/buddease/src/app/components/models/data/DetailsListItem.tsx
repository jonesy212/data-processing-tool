import { DetailsItem } from "../../state/stores/DetailsListStore";
import { Data } from "./Data";

// Define a mapped type to include all properties of Data
export type AllProperties = {
  [K in keyof Data]: Data[K];
};


// Define a new type for DetailsItem with all properties of Data
type DetailsItemAll<T> = DetailsItem<AllProperties>;

interface DetailsListItemProps<T extends Data> {
  item: DetailsItemAll<T>; // Use DetailsItemAll type
  label: string;
  value: string;
}

const DetailsListItem = <T extends Data>({ item, label, value }: DetailsListItemProps<T>) => {
  return (
    <div>
      <h3>{label}</h3>
      <p>{value}</p>
      <h3>{item.title}</h3>
      <p>{item.description}</p>
      {/* Render other item details as needed */}
    </div>
  );
};

export default DetailsListItem;
