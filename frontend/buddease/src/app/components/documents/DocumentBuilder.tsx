// DocumentBuilder.tsx
import { endpoints } from "@/app/api/ApiEndpoints";
import Clipboard from "@/app/ts/clipboard";
import { Editor, EditorState, Modifier, RichUtils } from "draft-js";
import "draft-js/dist/Draft.css";
import React, { useState } from "react";
import ResizablePanels from "../hooks/userInterface/ResizablePanels";
import useResizablePanels from "../hooks/userInterface/useResizablePanels";
import { useMovementAnimations } from "../libraries/animations/movementAnimations/MovementAnimationActions";
import PromptViewer from "../prompts/PromptViewer";
import axiosInstance from "../security/csrfToken";
import SharingOptions from "../shared/SharingOptions";
import {
  createPdfDocument,
  getFormattedOptions,
} from "./DocumentCreationUtils";
import { DocumentType } from "./DocumentGenerator";
import { DocumentOptions, DocumentSize } from "./DocumentOptions";
import { DocumentAnimationOptions } from "./SharedDocumentProps";
import { ToolbarOptions, ToolbarOptionsProps } from "./ToolbarOptions";
import { getTextBetweenOffsets } from "./getTextBetweenOffsets";



// DocumentData.tsx
export interface DocumentData extends Document {
  id: number;
  title: string;
  content: string;
  topics: string[]
  highlights: string[];
  load: () => void;
  files: any[]; 
  // Add more properties if needed
}

interface DocumentBuilderProps {
  options: DocumentOptions;
  onOptionsChange: (newOptions: DocumentOptions) => void;
  isDynamic: boolean;
  setOptions: (newOptions: any) => void; // Define setOptions prop

}

const DocumentBuilder: React.FC<DocumentBuilderProps> = ({
  isDynamic,
  options,
  onOptionsChange,
  setOptions, 

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

  const handleAnimationChange = (
    animationOptions: DocumentAnimationOptions
  ) => {
    onOptionsChange({ ...options, animations: animationOptions });
  };



  const handleOptionsChange = (newOptions: any) => {
    // Call setOptions prop to update options state
    setOptions(newOptions);
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

  const handleCreateDocument = (userOptions: any) => {
    const documentContent = editorState.getCurrentContent().getPlainText(); 
    const formattedOptions = getFormattedOptions(userOptions); 

    // Call a utility function to create a document (PDF or other formats)
    createPdfDocument(documentContent, formattedOptions);
  };

  
  const handleEditorStateChange = async (newEditorState: EditorState): Promise<void> => {
    // Update the editor state in DocumentBuilder
    setEditorState(newEditorState);

    // Accessing the content from the new editor state
    const content = newEditorState.getCurrentContent();
    console.log("New Editor State Content:", content.getPlainText());

    try {
      // Example: Perform a POST request to add data
      await axiosInstance.post(endpoints.data.addData, {
        data: content.getPlainText(),
      });

      // Example: Perform a GET request to fetch data
      const response = await axiosInstance.get(endpoints.data.list);
      console.log("Fetched data:", response.data);

      // You can perform other HTTP requests using Axios as needed
    } catch (error) {
      console.error("Error:", error);
    }
  };


  const handleCreateButtonClick = async () => {
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
      type: {} as DocumentType,
      handleEditorStateChange: handleEditorStateChange, // Corrected assignment here
      onEditorStateChange: handleEditorStateChange,
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
        {/* Sharing Options */}

        <SharingOptions
          onShareEmail={() => console.log("Share via Email")}
          onShareLink={() => console.log("Generate Shareable Link")}
          onShareSocialMedia={() => console.log("Share on Social Media")}
        />
        {/* Toolbar Options */}
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
          type={{} as ToolbarOptionsProps &
            DocumentType
          } 
          audio={true}
          onEditorStateChange={(newEditorState: any) => {
            setEditorState(newEditorState);
            const content = newEditorState.getCurrentContent();
            console.log("New Editor State Content:", content.getPlainText());
          }}
          handleEditorStateChange={(newEditorState: EditorState) => {
            // Handle editor state change
            // You can perform any custom logic here
            // For example, update state or trigger additional actions
          }}
        />
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
            {/* Separate Prompt Viewer component */}
      <PromptViewer
        prompts={[]} 
        children={null}
        />
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
