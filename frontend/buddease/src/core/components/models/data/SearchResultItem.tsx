// SearchResultItem.tsx
import { BaseEntity } from '@/core/config/BaseConfig';
import ListGenerator from '@/core/generators/ListGenerator';
import { Data } from '@/core/models/data/Data';
import { DetailsItem } from '@/core/state/stores/DetailsListStore';
import React from 'react';


interface SearchResultItemProps extends BaseEntity {
  id: number;
  title: string;
  description: string;
  source: string;
  items: DetailsItem<Data>[];
  result: any; // Add the result property here
  isGlobal: boolean;
  relevanceScore?: number;
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
