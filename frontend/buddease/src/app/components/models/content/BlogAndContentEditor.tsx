// BlogAndContentEditor.tsx
import React, { useState } from 'react';
import { EditorState } from 'draft-js';
import { Toolbar } from './Toolbar';

const BlogAndContentEditor: React.FC = () => {
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());

  const handleEditorStateChange = (newEditorState: EditorState) => {
    setEditorState(newEditorState);
  };

  return (
    <div className="editor-container">
      {/* Render the toolbar component */}
      <Toolbar onEditorStateChange={handleEditorStateChange} />
      {/* Render the Draft.js editor */}
      <div className="editor">
        {/* Render the Draft.js editor component here */}
      </div>
    </div>
  );
};

export default BlogAndContentEditor;
