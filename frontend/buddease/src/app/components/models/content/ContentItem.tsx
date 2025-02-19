import React, { useState } from "react";
import { FileType } from "../../documents/Attachment/attachment";
import { DetailsItem } from "../../state/stores/DetailsListStore";
import { Data } from "../data/Data";
import { StatusType } from "../data/StatusType";
import { Tag } from "../tracker/Tag";

// Check if the tag is an instance of Tag
function isTagObject(tag: string | Tag<any>): tag is Tag<any> {
  return (tag as Tag<any>).id !== undefined;
}

// Define the type for the data property
interface ContentData {
  stroke?: string;
  strokeWidth?: number;
  fillColor?: string;
  isFlippedX?: boolean;
  isFlippedY?: boolean;
  x?: number;
  y?: number;
}
// Define the type for the content item
interface ContentItem {
  then?(arg0: (newContent: any) => void): unknown;
  _id?: string;
  id: string; // Unique ID of the update
  title: string; // Title of the update (e.g., "Task Status Updated")
  body?: string; // Description or body of the update (e.g., details on what was changed)
  heading: React.ReactNode; // Main heading for UI rendering
  subheading?: React.ReactNode; // Optional subheading for more context
  description?: string | null | undefined; // Description for additional information
  type: FileType; // Type of content item (e.g., a text update, file attachment, etc.)
  footer?: React.ReactNode; // Footer, such as the user who made the update or the update date
  status: StatusType | undefined; // Status of the task after this update (e.g., "In Progress", "Completed")
  userId: string | undefined; // ID of the user who created this update
  updatedAt: Date | undefined; // The date and time when the update was made
  data?: ContentData;
  // Add more properties as needed
}

// Define the props interface for the ContentItem component
interface ContentItemProps {
  // Common props
  id?: string;
  title?: string;
  content?: string;
  // Specific props
  item?: DetailsItem<Data<any>>;
}

const ContentItemComponent: React.FC<ContentItemProps> = ({
  id,
  title,
  content,
  item,
}) => {
  const [duckDuckGoIcon, setDuckDuckGoIcon] = useState<React.ReactNode | null>(
    null
  );

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
            {tags.map((tag: any) =>
              typeof tag === "string" ? (
                <li key={tag}>{tag}</li>
              ) : (
                <li key={tag.getOptions().id}>{tag.getOptions().name}</li>
              )
            )}
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
export { isTagObject };
export type { ContentItem };





