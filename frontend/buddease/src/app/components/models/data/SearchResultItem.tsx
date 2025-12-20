// SearchResultItem.tsx
import { BaseEntity } from '@/app/config/BaseConfig';
import ListGenerator from '@/app/generators/ListGenerator';
import { Data } from '@/app/models/data/Data';
import { DetailsItem } from '@/app/state/stores/DetailsListStore';
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
