// ContentList.tsx
import type { ContentItem } from '@/core/components/models/content/ContentItem';
import type { DetailsItemCommon } from '@/core/generators/ListGenerator';
import ListGenerator from '@/core/generators/ListGenerator';
import type { Data } from '@/core/models/data/Data';
import type { DetailsItem } from '@/core/state/stores/DetailsListStore';
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
