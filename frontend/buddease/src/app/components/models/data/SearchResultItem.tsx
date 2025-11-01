// SearchResultItem.tsx
import { DetailsItem } from '@/app/state/stores/DetailsListStore';
import ListGenerator from '@/app/generators/ListGenerator';
import { BaseEntity } from '@/app/routing/FuzzyMatch';
import { Data } from '@/app/modes/data/Data';
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
