import React from "react";
import DummyCard from "./DummyCard";

interface ContentItem {
  heading: React.ReactNode;
  subheading?: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
}

interface DummyCardLoaderProps {
  items: { type: "file" | "folder"; name: string; content: ContentItem }[];
}


interface OrganizedCardLoaderProps {
  items: { type: "feedback" | "product"; content: ContentItem }[];
}


const DummyCardLoader: React.FC<DummyCardLoaderProps> = ({ items }) => {
  return (
    <div>
      <h3>Dummy Card Loader</h3>
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

export default OrganizedCardLoader; DummyCardLoader;
export type { DummyCardLoaderProps, OrganizedCardLoaderProps };

