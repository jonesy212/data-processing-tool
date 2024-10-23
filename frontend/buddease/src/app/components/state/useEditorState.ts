// useEditorState.ts
import { useState } from 'react';
import { EditorState } from 'draft-js';

const useEditorState = () => {
  // Initialize editor state with an empty editor state
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());

  // Function to handle editor state changes
  const handleEditorStateChange = (newEditorState: EditorState) => {
    setEditorState(newEditorState);
  };

  return {
    editorState,
    handleEditorStateChange,
  };
};

export default useEditorState;
