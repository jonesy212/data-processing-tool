// DocumentBuilder.tsx
import Clipboard from "@/app/ts/clipboard";
import { Editor, EditorState, Modifier, RichUtils } from "draft-js";
import "draft-js/dist/Draft.css";
import { useState } from "react";
import { useMovementAnimations } from "../animations/movementAnimations/MovementAnimationActions";
import ResizablePanels from "../hooks/userInterface/ResizablePanels";
import useResizablePanels from "../hooks/userInterface/useResizablePanels";
import SharingOptions from "../shared/SharingOptions";
import {
  createPdfDocument,
  getFormattedOptions,
} from "./DocumentCreationUtils";
import { DocumentOptions, DocumentSize } from "./DocumentOptions";
import { DocumentAnimationOptions } from "./SharedDocumentProps";
import { ToolbarOptions, ToolbarOptionsProps } from "./ToolbarOptions";
import { getTextBetweenOffsets } from "./getTextBetweenOffsets";

interface DocumentBuilderProps {
  options: DocumentOptions;
  onOptionsChange: (newOptions: DocumentOptions) => void;
  isDynamic: boolean;
}

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

  const handleCreateDocument = (userOptions: any) => {
    const documentContent = editorState.getCurrentContent().getPlainText(); // Extract content from the editor
    const formattedOptions = getFormattedOptions(userOptions); // Implement a function to get formatting options

    // Call a utility function to create a document (PDF or other formats)
    createPdfDocument(documentContent, formattedOptions);
  };

  const toggleVisibility = () => {
    setIsPublic((prevIsPublic) => !prevIsPublic);
  };

  const handleSizeChange = (newSize: DocumentSize) => {
    onOptionsChange({ ...options, size: newSize });
  };

  const handleAnimationChange = (
    animationOptions: DocumentAnimationOptions
  ) => {
    onOptionsChange({ ...options, animations: animationOptions });
  };

  const handleCopy = () => {
    // Get the current selected content from the editor
    const selection = editorState.getSelection();
    const currentContent = editorState.getCurrentContent();
    const selectedText = getTextBetweenOffsets(
      currentContent.getPlainText(),
      selection.getStartOffset(),
      selection.getEndOffset()
    );

    // Log the copied content
    console.log("Copied to DocumentBuilder:", selectedText);
  };

  const handlePaste = () => {
    // Simulate pasting content (replace with actual logic)
    const pastedContent = "Pasted Content";

    // Log the pasted content
    console.log("Pasted in DocumentBuilder:", pastedContent);

    // You can update the editor state with the pasted content if needed
    const newContentState = Modifier.replaceText(
      editorState.getCurrentContent(),
      editorState.getSelection(),
      pastedContent
    );

    const newEditorState = EditorState.push(
      editorState,
      newContentState,
      "insert-characters"
    );

    setEditorState(newEditorState);
  };

  

  const handleKeyCommand = (command: any, state: any) => {
    const newState = RichUtils.handleKeyCommand(state, command);

    if (newState) {
      setEditorState(newState);
      return "handled";
    }

    return "not-handled";
  };

  const handleCreateButtonClick = () => {
    // Call handleCreateDocument with userOptions
    const userOptions: ToolbarOptionsProps = {
      isDocumentEditor: true,
      fontSize: true,
      bold: true,
      italic: true,
      underline: true,
      strike: true,
      code: true,
      link: true,
      image: true,
      audio: true,
      onEditorStateChange: (newEditorState: any): void => {
        // Update the editor state in DocumentBuilder
        setEditorState(newEditorState);

        // Accessing the content from the new editor state
        const content = newEditorState.getCurrentContent();
        console.log("New Editor State Content:", content.getPlainText());
      },
      handleEditorStateChange: function (newEditorState: EditorState): void {
        throw new Error("Function not implemented.");
      }
    };

    // Call handleCreateDocument with userOptions
    handleCreateDocument(userOptions);
  };

  const handleDrag = () => {
    // Use the drag function here
    drag();
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
        <SharingOptions
          onShareEmail={() => console.log("Share via Email")}
          onShareLink={() => console.log("Generate Shareable Link")}
          onShareSocialMedia={() => console.log("Share on Social Media")}
        />
        <ToolbarOptions
          isDocumentEditor={true}
          fontSize={true}
          bold={true}
          italic={true}
          underline={true}
          strike={true}
          code={true}
          link={true}
          image={true}
          audio={true} onEditorStateChange={function (newEditorState: any): void {
            throw new Error("Function not implemented.");
          } } handleEditorStateChange={function (newEditorState: EditorState): void {
            throw new Error("Function not implemented.");
          } }        />
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
                type: e.target.value as "slide" | "fade" | "custom",
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
                type: e.target.value as "slide" | "fade" | "custom",
              })
            }
          >
            <option value="slide">Slide</option>
            <option value="fade">Fade</option>
            <option value="custom">Custom</option>
          </select>
        </label>
        {options.animations.type === "custom" && (
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
          <ResizablePanels sizes={() => panelSizes} onResize={handleResize}>
            {/* Panel contents go here */}
            <div>Panel 1</div>
            <div>Panel 2</div>
            <div>Panel 3</div>
          </ResizablePanels>
        </div>
      )}
      {isDynamic && options.animations.type === "slide" && (
        <button onClick={() => slide(100, "left")}>Slide Left</button>
      )}
      {isDynamic && options.animations.type === "slide" && (
        <button onClick={() => slide(100, "right")}>Slide Right</button>
      )}
      {isDynamic && options.animations.type === "slide" && (
        <button onClick={() => slide(100, "up")}>Slide Up</button>
      )}
      {isDynamic && options.animations.type === "slide" && (
        <button onClick={() => slide(100, "down")}>Slide Down</button>
      )}
      {isDynamic && options.animations.type === "show" && (
        <button onClick={() => show()}>Show</button>
      )}
      {isDynamic && <button onClick={handleDrag}>Drag</button>}
      {isDynamic && (
        <button onClick={handleCreateButtonClick}>Create Document</button>
      )}
      {renderDocument()}
    </div>
  );
};

export default DocumentBuilder;
