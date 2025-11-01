// ContentList.tsx
import ListGenerator, { DetailsItemCommon } from '@/app/generators/ListGenerator';
import { Data } from '@/app/models/data/Data';
import { DetailsItem } from '@/app/state/stores/DetailsListStore';
import { ContentItem } from '@/ContentItem';
import React from 'react';

interface ContentListProps {
  contentItems: DetailsItem<ContentItem>[]; // Assuming 'contentItems' contain DetailsItem with ContentItem type
  onContentItemClick: (item: DetailsItemCommon<Data>) => void
}

const ContentList: React.FC<ContentListProps> = ({ contentItems, onContentItemClick }) => {
  return (
    <div>
      <h2>Content List</h2>
      {/* Render the ListGenerator component with the content item details */}
      <ListGenerator items={contentItems} onItemClick={onContentItemClick} />
    </div>
  );
};

export default ContentList;
