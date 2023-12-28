// DocumentBuilder.tsx
import Clipboard from "@/app/ts/clipboard";
import { Editor, EditorState, RichUtils } from "draft-js";
import "draft-js/dist/Draft.css";
import { useState } from "react";
import { useMovementAnimations } from "../animations/movementAnimations/MovementAnimationActions";
import ResizablePanels from "../hooks/userInterface/ResizablePanels";
import useResizablePanels from "../hooks/userInterface/useResizablePanels";
import { DocumentSize } from "./DocumentOptions";
import { DocumentAnimationOptions, DocumentBuilderProps } from "./SharedDocumentProps";

const DocumentBuilder: React.FC<DocumentBuilderProps> = ({
  isDynamic,
  options,
  onOptionsChange,
}) => {
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  );
  const [isPublic, setIsPublic] = useState(false);
  const { panelSizes, handleResize } = useResizablePanels();
  const { slide, drag, show } = useMovementAnimations();

  const toggleVisibility = () => {
    setIsPublic((prevIsPublic) => !prevIsPublic);
  };

  const handleSizeChange = (newSize: DocumentSize) => {
    onOptionsChange({ ...options, size: newSize });
  };

  const handleAnimationChange = (animationOptions: DocumentAnimationOptions) => {
    onOptionsChange({ ...options, animations: animationOptions });
  };

  const handleCopy = (content: string) => {
    // Handle the copied content in the DocumentBuilder component
    console.log('Copied to DocumentBuilder:', content);
  };

  const handlePaste = (content: string) => {
    // Handle the pasted content in the DocumentBuilder component
    console.log('Pasted in DocumentBuilder:', content);
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
      <h1>Document Builder</h1>
      <Clipboard onCopy={handleCopy} onPaste={handlePaste} />
      {/* Other DocumentBuilder components go here */}
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
      <div>
        <label>
          Document Size:
          <select
            value={options.size}
            onChange={(e) => handleSizeChange(e.target.value as DocumentSize)}
          >
            <option value="letter">Letter</option>
            <option value="legal">Legal</option>
            <option value="a4">A4</option>
            <option value="custom">Custom</option>
          </select>
        </label>
      </div>
      <div>
        {/* Additional options UI */}
        <label>
          Animation Type:
          <select
            value={options.animations.type}
            onChange={(e) =>
              handleAnimationChange({
                ...options.animations,
                type: e.target.value as 'slide' | 'fade' | 'custom',
              })
            }
          >
            <option value="slide">Slide</option>
            <option value="fade">Fade</option>
            <option value="custom">Custom</option>
          </select>
        </label>
      </div>
      <div>
        {/* Additional options UI */}
        <label>
          Animation Type:
          <select
            value={options.animations.type}
            onChange={(e) =>
              handleAnimationChange({
                ...options.animations,
                type: e.target.value as 'slide' | 'fade' | 'custom',
              })
            }
          >
            <option value="slide">Slide</option>
            <option value="fade">Fade</option>
            <option value="custom">Custom</option>
          </select>
        </label>
        {options.animations.type === 'custom' && (
          <div>
            {/* Add custom animation options UI */}
            <label>
              Animation Duration:
              <input
                type="number"
                value={options.animations.duration}
                onChange={(e) =>
                  handleAnimationChange({
                    ...options.animations,
                    duration: parseInt(e.target.value, 10),
                  })
                }
              />
            </label>
            {/* Add more custom animation options as needed */}
          </div>
        )}
      </div>
      {isDynamic && (
        <div>
          <h3>Resizable Panels</h3>
          <ResizablePanels sizes={} onResize={handleResize}>
            {/* Panel contents go here */}
            <div>Panel 1</div>
            <div>Panel 2</div>
            <div>Panel 3</div>
          </ResizablePanels>
        </div>
      )}
      {isDynamic && options.animations.type === 'slide' && (
        <button onClick={() => slide(100, 'left')}>Slide Left</button>
      )}
      {isDynamic && options.animations.type === 'slide' && (
        <button onClick={() => slide(100, 'right')}>Slide Right</button>
      )}
      {isDynamic && options.animations.type === 'slide' && (
        <button onClick={() => slide(100, 'up')}>Slide Up</button>
      )}
      {isDynamic && options.animations.type === 'slide' && (
        <button onClick={() => slide(100, 'down')}>Slide Down</button>
      )}
      {isDynamic && options.animations.type === 'show' && (
        <button onClick={() => show()}>Show</button>
      )}
      {renderDocument()}
    </div>
  );
};

export default DocumentBuilder;
