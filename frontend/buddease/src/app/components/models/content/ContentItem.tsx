import React, { useState } from "react";
import { DetailsItem } from "../../state/stores/DetailsListStore";
import { Data } from "../data/Data";

// Define the type for the content item
interface ContentItem {
  id: string;
  title: string;
  body: string;
  heading: React.ReactNode;
  subheading?: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  // Add more properties as needed
}

// Define the props interface for the ContentItem component
interface ContentItemProps {
  // Common props
  id?: string;
  title?: string;
  content?: string;
  // Specific props
  item?: DetailsItem<Data>;
}

const ContentItemComponent: React.FC<ContentItemProps> = ({
  id,
  title,
  content,
  item,
}) => {
  const [duckDuckGoIcon, setDuckDuckGoIcon] = useState<React.ReactNode | null>(null);

  // Render based on the presence of item props
  if (item) {
    // Extract relevant details from the item object
    const {
      title: itemTitle,
      description,
      subtitle,
      date,
      author,
      tags,
    } = item;
    return (
      <div className="content-item">
        <h2>{itemTitle}</h2>
        <p>{description}</p>
        {/* Render other details as needed */}
        {duckDuckGoIcon} {/* Render the DuckDuckGo icon */}
        {subtitle && <h3>{subtitle}</h3>}
        {date && <p>Date: {date.toString()}</p>}
        {author && <p>Author: {author}</p>}
        {tags && (
          <ul>
            {tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        )}
      </div>
    );
  } else {
    return (
      <div>
        <h3>{title}</h3>
        <p>{content}</p>
        {/* Render additional content item details */}
        {duckDuckGoIcon} {/* Render the DuckDuckGo icon */}
      </div>
    );
  }
};

export default ContentItemComponent;
export type { ContentItem };
