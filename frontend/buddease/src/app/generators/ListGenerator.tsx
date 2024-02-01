import DetailsListItem from './DetailsListItem';
import { DetailsItem } from './DetailsListStore';

interface ListGeneratorProps<T> {
  items: DetailsItem<T>[];
}

const ListGenerator = <T extends {}>({ items }: ListGeneratorProps<T>) => {
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
