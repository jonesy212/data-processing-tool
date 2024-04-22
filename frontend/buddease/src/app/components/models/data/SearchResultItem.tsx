// SearchResultItem.tsx
import ListGenerator from '@/app/generators/ListGenerator';
import React from 'react';
import { DetailsItem } from '../../state/stores/DetailsListStore';
import { Data } from './Data';


interface SearchResultItemProps {
  id: number;
  title: string;
  description: string;
  source: string;
  items: DetailsItem<Data>[];
  result: any; // Add the result property here
}

const SearchResultItem: React.FC<SearchResultItemProps> = ({ items, id, title, description, source }) => {

  return (
    <div className="search-result-item">
      <ListGenerator items={items} />
      {/* <p>{result}</p> */}
    </div>
  );
};

export default SearchResultItem;
