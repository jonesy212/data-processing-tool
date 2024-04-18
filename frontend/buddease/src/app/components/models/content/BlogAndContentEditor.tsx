// BlogAndContentEditor.tsx
import React, { useState } from 'react';
import { EditorState } from 'draft-js';
import Toolbar from '../../documents/Toolbar';

interface BlogAndContentEditorProps {
  contentItemId: string;
  editorState: EditorState;
}

const BlogAndContentEditor: React.FC<BlogAndContentEditorProps> = ({
  contentItemId,
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
