import React from "react";
import { ContentItem } from "../models/content/ContentItem";
import DummyCard from "./DummyCard";
 


interface DummyCardLoaderProps {
  items: {
    type: "file" | "folder";
    name: string;
    content: ContentItem;
    
  }[];
}

interface OrganizedCardLoaderProps {
  items:
    | {
        type: "file" | "folder";
        name: string;
        content: ContentItem;
      }[]
    | {
        type: "product" | "feedback";
        name: string;
        content: ContentItem;
      }[];
}


type CombinedItem = {
  type: "file" | "folder";
  name: string;
  content: ContentItem;
};

const fileFolderItems: {
  type: "file" | "folder";
  name: string;
  content: ContentItem;
}[] = [
  {
    type: "file",
    name: "IdeaDocument.pdf",
    content: {
      heading: "Idea Document",
      description: "Details of the new feature idea",
      id: "",
      title: "",
      body: "",
      status: undefined,
      type: "image",
      userId: undefined,
      updatedAt: new Date(),
    },
  },
  {
    type: "folder",
    name: "Sketches",
    content: {
      heading: "Sketches",
      description: "Visual representations of ideas",
      id: "",
      title: "",
      body: "",
      status: undefined,
      type: "image",
      userId: undefined,
      updatedAt: new Date(),
    },
  },
];

const productFeedbackItems: {
  type: "product" | "feedback";
  name: string;
  content: ContentItem;
}[] = [
  {
    type: 'product',
    name: 'FeatureX',
    content: {
      heading: 'Feature X',
      description: 'A suggested product feature',
      id: "",
      title: "",
      body: "",
      status: undefined,
      type: "image",
      userId: undefined,
      updatedAt: new Date(), // Added updatedAt property

    },
  },
  {
    type: 'feedback',
    name: 'UserFeedback',
    content: {
      heading: 'User Feedback',
      description: 'Feedback on existing features',
      id: "",
      title: "",
      body: "",
      status: undefined,
      type: "image",
      userId: undefined,
      updatedAt: new Date()
    },
  },
];

const ideationItems: CombinedItem[] = [
  ...fileFolderItems,
  ...productFeedbackItems.map(item => ({
    type: item.type as "file" | "folder",
    name: item.name,
    content: item.content,
  })),
];
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
      {/* Pass the ideationItems to OrganizedCardLoader */}
      <OrganizedCardLoader items={ideationItems} />
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

export default OrganizedCardLoader;
export type { ContentItem, DummyCardLoaderProps, OrganizedCardLoaderProps };

