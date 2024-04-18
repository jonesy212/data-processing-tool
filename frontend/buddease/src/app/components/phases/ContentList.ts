// ContentList.tsx
import { DetailsItem } from '@/app/components/state/stores/DetailsListStore';
import React from 'react';
import { ContentItem } from '../models/content/ContentItem';

interface ContentListProps {
  contentItems: DetailsItem<ContentItem>[]; // Assuming 'contentItems' contain DetailsItem with ContentItem type
  onContentItemClick: (contentItemId: string) => void; // Function to handle content item click
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
