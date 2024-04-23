// BlogAndContentEditor.tsx
import React, { useState } from 'react';
import { EditorState } from 'draft-js';
import Toolbar from '../../documents/Toolbar';
import ContentType from '../../typings/ContentType';

interface BlogAndContentEditorProps {
  contentItemId: string;
  editorState: EditorState;
  initialContent: string;
  activeDashboard: string;
  onContentChange: (newContent: ContentType) => void;
  contentType: {
    label: string;
    value: string;
  }
  
}

const BlogAndContentEditor: React.FC<BlogAndContentEditorProps> = ({
  contentItemId,
  activeDashboard
}) => {
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  );

  const handleEditorStateChange = (newEditorState: EditorState) => {
    setEditorState(newEditorState);
  };

  return (
    <div className="editor-container">
      {/* Render the toolbar component */}
      <Toolbar
        activeDashboard={activeDashboard}
        progress={{percentage: 50}}
        editorState={editorState}
        onEditorStateChange={handleEditorStateChange}
        // Add any other required props for Toolbar component
      />
      {/* Render the Draft.js editor */}
      <div className="editor">
        {/* Render the Draft.js editor component here */}
      </div>
    </div>
  );
};

export default BlogAndContentEditor;
