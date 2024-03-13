// ContentItem.tsx
import React from 'react';
import { DetailsItem } from '../../state/stores/DetailsListStore';
import { Data } from './Data';

interface ContentItemProps {
  item: DetailsItem<Data>;
}

const ContentItem: React.FC<ContentItemProps> = ({ item }) => {
  // Extract relevant details from the item object
  const { title, description, /* Add other relevant details here */ } = item;

  return (
    <div className="content-item">
      <h2>{title}</h2>
      <p>{description}</p>
      {/* Render other details as needed */}
    </div>
  );
};

export default ContentItem;
