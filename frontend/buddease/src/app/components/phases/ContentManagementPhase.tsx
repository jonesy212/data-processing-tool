// ContentManagementPhase.tsx
import React from "react";
import useContentManagementStore from "../state/stores/ContentStore";
import BlogAndContentEditor from "../models/content/BlogAndContentEditor";
import ContentList from "../models/content/ContentList";
import ContentType from "../typings/ContentType";
import { EditorState } from "draft-js";
import { Data } from "../models/data/Data";
import { ListGeneratorProps } from "@/app/generators/ListGenerator";



export enum ContentManagementPhaseEnum {
  CONTENT_ITEM_SELECTION = "CONTENT_ITEM_SELECTION",
  CONTENT_EDITING = "CONTENT_EDITING",
  CONTENT_CREATION = "CONTENT_CREATION",
  CONTENT_ORGANIZATION = "CONTENT_ORGANIZATION",
  CONTENT_PUBLISHING = "CONTENT_PUBLISHING",
  PROFILE_SETUP = "PROFILE_SETUP",
  IDEA_CREATION = "IDEA_CREATION",
}



const ContentManagementPhase: React.FC = () => {
  const { contentItems, selectedContentItemId, setSelectedContentItemId } = useContentManagementStore();

  const handleContentItemClick = (contentItemId: ListGeneratorProps<Data>['items'][0] | null) => {
    setSelectedContentItemId(contentItemId);
  };

  return (
    <div>
      <h2>Content Management Phase</h2>
      <ContentList
        contentItems={contentItems}
        onContentItemClick={handleContentItemClick}
      />
      {selectedContentItemId && <BlogAndContentEditor
        
        contentItemId={selectedContentItemId} editorState={new EditorState}
        initialContent={""}
        activeDashboard={""}
        onContentChange={function (
          newContent: ContentType): void {
          // update content in store
          
                  } } contentType={{
          label: "",
          value: ""
        }}
      />}
    </div>
  );
};

export default ContentManagementPhase;
