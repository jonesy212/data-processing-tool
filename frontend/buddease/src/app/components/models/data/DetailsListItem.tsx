import React from "react";
import { DetailsItem } from "../../state/stores/DetailsListStore";
import { BaseData , Data} from '@/app/components/models/data/Data';
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { K } from "./dataStoreMethods";

// Define a mapped type to include all properties of Data
export type AllProperties<T extends BaseData<T>> = {
  [P in keyof Data<T>]: Data<T>[P];
};

// Define a new type for DetailsItem with all properties of Data, but make them optional
type DetailsItemAll<T extends BaseData<T>> = DetailsItem<Partial<AllProperties<T>>>;

interface DetailsListItemProps<T extends BaseData<T>> {
  item: DetailsItemAll<T>; // Use DetailsItemAll type
  label: string;
  value: string;
}

const DetailsListItem = <T extends BaseData<T>>({ item, label, value }: DetailsListItemProps<T>) => {
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
