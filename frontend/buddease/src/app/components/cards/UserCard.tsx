// UserCard.tsx
import React from "react";
import DummyCard from "./DummyCard";
import { ContentItem } from '@/app/components/models/content/ContentItem';


interface OrganizedCardLoaderProps {
  items: {
    type: "file" | "folder" | "product" | "feedback";
    name: string;
    content: ContentItem;
  }[];
}

const OrganizedCardLoader: React.FC<OrganizedCardLoaderProps> = ({ items }) => {
  return (
    <div>
      <h3>Organized Card Loader</h3>
      {items.map((item, index) => (
        <DummyCard
          key={index}
          content={
            <div>
              <div>{item.content.heading}</div>
              {item.content.subheading && <div>{item.content.subheading}</div>}
              {item.content.description && <div>{item.content.description}</div>}
              {item.content.footer && <div>{item.content.footer}</div>}
            </div>
          }
          onDragStart={() => console.log("Drag Start")}
          onDragEnd={() => console.log("Drag End")}
        />
      ))}
    </div>
  );
};

export default OrganizedCardLoader;
export type { OrganizedCardLoaderProps };

