// SearchResultItem.tsx
import React from 'react';
import { Data } from './Data';
import { DetailsItem } from '../../state/stores/DetailsListStore';
import ListGenerator from '@/app/generators/ListGenerator';


interface SearchResultItemProps {
  items: DetailsItem<Data>[];
}

const SearchResultItem: React.FC<SearchResultItemProps> = ({ items }) => {
  return (
    <div className="search-result-item">
      <ListGenerator items={items} />
    </div>
  );
};

export default SearchResultItem;
