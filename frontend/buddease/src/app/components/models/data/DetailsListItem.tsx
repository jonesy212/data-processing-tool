import { DetailsItem } from './DetailsListStore';

interface DetailsListItemProps<T> {
  item: DetailsItem<T>;
}

const DetailsListItem = <T extends {}>({ item }: DetailsListItemProps<T>) => {
  return (
    <div>
      <h3>{item.title}</h3>
      <p>{item.description}</p>
      {/* Render other item details as needed */}
    </div>
  );
};

export default DetailsListItem;
