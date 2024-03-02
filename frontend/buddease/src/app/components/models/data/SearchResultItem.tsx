// SearchResultItem.tsx
import React from 'react';
import ListGenerator from './ListGenerator';
import DetailsListItem from '../components/models/data/DetailsListItem';
import { DetailsItem } from '../components/state/stores/DetailsListStore';

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
