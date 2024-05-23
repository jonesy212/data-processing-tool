// BlogAndContentEditor.tsx
import React, { useState } from 'react';
import { EditorState } from 'draft-js';
import Toolbar from '../../documents/Toolbar';
import ContentType from '../../typings/ContentType';
import { ToolbarOptions } from '../../documents/ToolbarOptions';



export type ActiveDashboardType = "tasks" | "settings" | "communication" | "documents" | "crypto" | "editorState" | "community" | "analytics" | "ui" | "onEditorStateChange"
interface BlogAndContentEditorProps {
  contentItemId: string;
  editorState: EditorState;
  initialContent: string;
  activeDashboard: ActiveDashboardType;
  onContentChange: (newContent: ContentType) => void;
  contentType: {
    label: string;
    value: string;
  }
  
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
