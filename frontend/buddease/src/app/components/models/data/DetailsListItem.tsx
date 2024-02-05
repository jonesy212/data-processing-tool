import { DetailsItem } from "../../state/stores/DetailsListStore";
import { Data } from "./Data";

interface DetailsListItemProps<T> {
  item: DetailsItem<T>;
  label: string;
  value: string;
  
}

const DetailsListItem: React.FC<DetailsListItemProps<Data>> = ({ item, label, value }) => {
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
