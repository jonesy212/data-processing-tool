// SearchResultItem.tsx
import ListGenerator from '@/app/generators/ListGenerator';
import React from 'react';
import { DetailsItem } from '../../state/stores/DetailsListStore';
import { Data } from './Data';


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
