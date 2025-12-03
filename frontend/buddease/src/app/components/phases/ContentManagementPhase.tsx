// ContentManagementPhase.tsx
import { ListGeneratorProps } from '@/app/generators/ListGenerator';
import BlogAndContentEditor from '@/app/components/models/content/BlogAndContentEditor';
import ContentList from '@/app/components/models/content/ContentList';
import { Data } from '@/app/models/data/Data';
import useContentManagementStore from '@/app/state/stores/ContentStore';
import ContentType from '@/app/typings/contentTypes';
import { EditorState } from 'draft-js';
import React from 'react';

export enum ContentManagementPhaseEnum {
  CONTENT_ITEM_SELECTION = "CONTENT_ITEM_SELECTION",
  CONTENT_EDITING = "CONTENT_EDITING",
  CONTENT_CREATION = "CONTENT_CREATION",
  CONTENT_ORGANIZATION = "CONTENT_ORGANIZATION",
  CONTENT_PUBLISHING = "CONTENT_PUBLISHING",
  PROFILE_SETUP = "PROFILE_SETUP",
  IDEA_CREATION = "CM_IDEA_CREATION", 
}



const ContentManagementPhase: React.FC = () => {
  const { contentItems, selectedContentItemId, setSelectedContentItemId } =
    useContentManagementStore();

  const handleContentItemClick = (
    contentItemId: ListGeneratorProps<Data>["items"][0] | null
  ) => {
    setSelectedContentItemId(contentItemId);
  };

  return (
    <div>
      <h2>Content Management Phase</h2>
      <ContentList
        contentItems={contentItems}
        onContentItemClick={handleContentItemClick}
      />
      {selectedContentItemId && (
        <BlogAndContentEditor
          contentItemId={selectedContentItemId}
          editorState={new EditorState()}
          initialContent={""}
          activeDashboard={"content"}
          onContentChange={function (newContent: ContentType): void {
            // update content in store
          }}
          contentType={{
            label: "",
            value: "",
          }}
        />
      )}
    </div>
  );
};

export default ContentManagementPhase;
