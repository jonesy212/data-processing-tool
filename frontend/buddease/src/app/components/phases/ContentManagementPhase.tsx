// ContentManagementPhase.tsx
// ContentManagementPhase.tsx
import React from "react";
import { ContentEditor } from "./ContentEditor";
import { ContentList } from "./ContentList";
import { useContentManagement } from "./ContentManagementContext";


enum ContentManagementPhase {
    CONTENT_ITEM_SELECTION = "CONTENT_ITEM_SELECTION",
    CONTENT_EDITING = "CONTENT_EDITING",
    CONTENT_CREATION = "CONTENT_CREATION",
    CONTENT_ORGANIZATION = "CONTENT_ORGANIZATION",
    CONTENT_PUBLISHING = "CONTENT_PUBLISHING",
}
  


const ContentManagementPhase: React.FC = () => {
  const { contentItems, selectedContentItemId, setSelectedContentItemId } = useContentManagement();

  const handleContentItemClick = (contentItemId: string) => {
    setSelectedContentItemId(contentItemId);
  };

  return (
    <div>
      <h2>Content Management Phase</h2>
      <ContentList contentItems={contentItems} onContentItemClick={handleContentItemClick} />
      {selectedContentItemId && <ContentEditor contentItemId={selectedContentItemId} />}
    </div>
  );
};

export default ContentManagementPhase;
