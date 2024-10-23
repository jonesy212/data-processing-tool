// BlogAndContentEditor.tsx
import { DetailsItemCommon } from "@/app/generators/ListGenerator";
import { EditorState } from "draft-js";
import React, { useState } from "react";
import Toolbar from "../../documents/Toolbar";
import { ToolbarOptions } from "../../documents/ToolbarOptions";
import ContentType from "../../typings/ContentType";
import { Data } from "../data/Data";

export type ActiveDashboardType =
  | "tasks"
  | "settings"
  | "communication"
  | "documents"
  | "crypto"
  | "editorState"
  | "community"
  | "analytics"
  | "ui"
  | "onEditorStateChange"
  | "content";
interface BlogAndContentEditorProps {
  contentItemId: string | DetailsItemCommon<Data> ;
  editorState: EditorState;
  initialContent: string;
  activeDashboard: ActiveDashboardType;
  onContentChange: (newContent: ContentType) => void;
  contentType: {
    label: string;
    value: string;
  };
}

const BlogAndContentEditor: React.FC<BlogAndContentEditorProps> = ({
  contentItemId,
  activeDashboard,
}) => {
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  );

  const handleEditorStateChange = (newEditorState: EditorState) => {
    setEditorState(newEditorState);
  };

  const toolbarOptions: ToolbarOptions = {
    communication: [],
    documents: [],
    tasks: [],
    settings: [],
    calendar: [],
    contacts: [],
    notes: [],
    reminders: [],
    search: [],
    help: [],
    crypto: [],
    analytics: [],
    community: [],
    ui: [],
    onEditorStateChange: [],
    editorState: [],
    content: [],
    userManagement: [],
    notifications: [],
    integrations: [],
    mediaManagement: [],
    projectManagement: [],
    ecommerce: [],
    reporting: [],
    contentCreation: [],
    customerSupport: [],
    marketing: [],
  };

  return (
    <div className="editor-container">
      <Toolbar
        activeDashboard={activeDashboard}
        progress={{
          id: "editor-progress",
          value: 50,
          label: "Editor Progress",
          current: 50,
          max: 100,
          percentage: 0,
        }}
        editorState={editorState}
        onEditorStateChange={handleEditorStateChange}
        toolbarOptions={toolbarOptions}
      />
      <div className="editor">
        {/* Render the Draft.js editor component here */}
      </div>
    </div>
  );
};

export default BlogAndContentEditor;
