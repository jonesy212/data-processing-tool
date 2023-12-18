import { Editor, EditorState, RichUtils } from 'draft-js';
import 'draft-js/dist/Draft.css';
import { useState } from 'react';

const DocumentBuilder = ({ isDynamic }: { isDynamic: boolean }) => {
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  );
  const [isPublic, setIsPublic] = useState(false);

  const toggleVisibility = () => {
    setIsPublic((prevIsPublic) => !prevIsPublic);
  };

  const handleKeyCommand = (command: any, state: any) => {
    const newState = RichUtils.handleKeyCommand(state, command);

    if (newState) {
      setEditorState(newState);
      return "handled";
    }

    return "not-handled";
  };

  const renderDocument = () => {
    if (isDynamic) {
      return (
        <div style={{ border: "1px solid #ccc", padding: "10px" }}>
          <Editor
            editorState={editorState}
            onChange={(newState: any) => setEditorState(newState)}
            handleKeyCommand={handleKeyCommand}
          />
        </div>
      );
    } else {
      return (
        <div>
          <p>This is a static document.</p>
          <p>Content goes here.</p>
        </div>
      );
    }
  };

  return (
    <div>
      <div>
        <label>
          Document Visibility:
          <input
            type="checkbox"
            checked={isPublic}
            onChange={toggleVisibility}
          />
          {isPublic ? "Public" : "Private"}
        </label>
      </div>
      {renderDocument()}
    </div>
  );
};

export default DocumentBuilder;
