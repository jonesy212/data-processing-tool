// ContentManagementPhase.tsx
import React from "react";
import useContentManagementStore from "../state/stores/ContentStore";
import BlogAndContentEditor from "../models/content/BlogAndContentEditor";



export enum ContentManagementPhaseEnum {
  CONTENT_ITEM_SELECTION = "CONTENT_ITEM_SELECTION",
  CONTENT_EDITING = "CONTENT_EDITING",
  CONTENT_CREATION = "CONTENT_CREATION",
  CONTENT_ORGANIZATION = "CONTENT_ORGANIZATION",
  CONTENT_PUBLISHING = "CONTENT_PUBLISHING",
}



const ContentManagementPhase: React.FC = () => {
  const { contentItems, selectedContentItemId, setSelectedContentItemId } = useContentManagementStore();

  const handleContentItemClick = (contentItemId: string) => {
    setSelectedContentItemId(contentItemId);
  };

  return (
    <div>
      <h2>Content Management Phase</h2>
      <ContentList
        contentItems={contentItems}
        onContentItemClick={handleContentItemClick}
      />
      {selectedContentItemId && <BlogAndContentEditor contentItemId={selectedContentItemId} />}
    </div>
  );
};

export default ContentManagementPhase;
