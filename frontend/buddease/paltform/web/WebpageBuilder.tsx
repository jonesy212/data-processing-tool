import { endpoints } from "@/app/api/ApiEndpoints";
import { DocumentTypeEnum } from "@/app/components/documents/DocumentGenerator";
import {
  ToolbarOptionsComponent,
  ToolbarOptionsProps,
} from "@/app/components/documents/ToolbarOptions";
import { getTextBetweenOffsets } from "@/app/components/documents/getTextBetweenOffsets";
import useErrorHandling from "@/app/components/hooks/useErrorHandling";
import ResizablePanels from "@/app/components/hooks/userInterface/ResizablePanels";
import useResizablePanels from "@/app/components/hooks/userInterface/useResizablePanels";
import { useMovementAnimations } from "@/app/components/libraries/animations/movementAnimations/MovementAnimationActions";
import { WebLogger } from "@/app/components/logging/Logger";
import axiosInstance from "@/app/components/security/csrfToken";
import Clipboard from "@/app/ts/clipboard";
import { ContentState, Editor, EditorState, Modifier, RichUtils } from "draft-js";
import React, { useState } from "react";

const BASE_URL = "https://example.com";
const API_BASE_URL = endpoints.web;


interface DocumentProps {
  title: string;
  content: string;
  author: string;
  createdAt: Date;
}

// WebpageBuilderProps for passing editor and builder data
interface WebpageBuilderProps {
  document: DocumentProps;
  onSave: (document: DocumentProps) => void;
  onError: (error: string) => void;
}
const WebpageBuilder: React.FC<WebpageBuilderProps> = ({ document, onSave, onError }) => {
  const [editorState, setEditorState] = useState(() =>
    EditorState.createWithContent(ContentState.createFromText(document.content))
  );

    
  const { panelSizes, handleResize } = useResizablePanels();
  const { slide, drag, show } = useMovementAnimations();
  const { handleError } = useErrorHandling(); // Access handleError function from useErrorHandling

  const handleKeyCommand = (command: any, state: any) => {
    const newState = RichUtils.handleKeyCommand(state, command);

    if (newState) {
      setEditorState(newState);
      return "handled";
    }
    return "not-handled";
  };

  const updatedEndpoints = {
    ...API_BASE_URL,
    newData: `${BASE_URL}/api/messages/web/newData`,
  };

  endpoints.web = updatedEndpoints;

  const handleCopy = () => {
    const selection = editorState.getSelection();
    const currentContent = editorState.getCurrentContent();
    const selectedText = getTextBetweenOffsets(
      currentContent.getPlainText(),
      selection.getStartOffset(),
      selection.getEndOffset()
    );

    console.log("Copied to WebpageBuilder:", selectedText);
  };

  const handlePaste = () => {
    const pastedContent = "Pasted Content";

    console.log("Pasted in WebpageBuilder:", pastedContent);

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

    // Handle error using handleError function
    handleError("Error while pasting content in WebpageBuilder");
  };

  const handleEditorStateChange = async (
    newEditorState: EditorState
  ): Promise<void> => {
    setEditorState(newEditorState);

    const content = newEditorState.getCurrentContent();
    console.log("New Editor State Content:", content.getPlainText());

    try {
      const postResponse = await axiosInstance.post(`${API_BASE_URL}/addData`, {
        data: content.getPlainText(),
      });
      const { csrfToken } = postResponse.data;
      axiosInstance.defaults.headers.common["X-CSRF-Token"] = csrfToken;

      const getResponse = await axiosInstance.get(`${API_BASE_URL}/list`);
      console.log("Fetched data:", getResponse.data);
    } catch (error) {
      console.error("Error:", error);

      // Log error using WebLogger
      await WebLogger.logWebEvent(
        "editorStateChangeError",
        "Error while handling editor state change",
        error
      );
    }
  };

  const handleCreateButtonClick = async () => {
    const userOptions: ToolbarOptionsProps = {
      isDocumentEditor: true,
      fontSize: "16px",
      bold: true,
      italic: true,
      underline: true,
      strike: true,
      code: true,
      link: true,
      image: true,
      audio: true,
      type: {} as DocumentTypeEnum,
      handleEditorStateChange: handleEditorStateChange,
      onEditorStateChange: handleEditorStateChange,
    };
    return (
      <ResizablePanels
        sizes={[50, 50].map(() => 50)}
        snap={true}
        onResize={handleResize}
        onResizeStop={handleResize}
        panelSizes={panelSizes}
      >
        <div>
          <Editor
            editorState={editorState}
            onChange={handleEditorStateChange}
            handleKeyCommand={handleKeyCommand}
          />
        </div>
        <button onClick={handleCopy}>Copy</button>
        <button onClick={handlePaste}>Paste</button>
        <button onClick={handleDrag}>Drag</button>
        <button onClick={handleShow}>Show</button>
      </ResizablePanels>
    );
  };

  const handleDrag = () => {
    drag();
  };

  const handleShow = () => {
    show();
  };

  const handleSlide = () => {
    slide(100, "left");
  };

  const panelContent: string[] = ["Panel 1", "Panel 2", "Panel 3"];

  const currentFontSize = "16px";
  return (
    <div>
      <div>
        <ToolbarOptionsComponent
          isDocumentEditor={true}
          fontSize={currentFontSize}
          bold={true}
          italic={true}
          underline={true}
          strike={true}
          code={true}
          link={true}
          image={true}
          type={{} as DocumentTypeEnum}
          audio={true}
          onEditorStateChange={(newEditorState: any) => {
            setEditorState(newEditorState);
            const content = newEditorState.getCurrentContent();
            console.log("New Editor State Content:", content.getPlainText());
          }}
          handleEditorStateChange={handleEditorStateChange}
        />
        <h1>Webpage Builder</h1>
        <Clipboard onCopy={handleCopy} onPaste={handlePaste} />
      </div>
      <div>
        <div>
          <h3>Resizable Panels</h3>
          <ResizablePanels
            sizes={() => panelSizes}
            onResize={handleResize}
            onResizeStop={(newSizes: number[]) => {
              handleResize(newSizes);
            }}
          >
            {panelContent.map((content: any, index: any) => (
              <div key={index}>{content}</div>
            ))}
          </ResizablePanels>
        </div>
        <button onClick={handleDrag}>Drag</button>
        <button onClick={handleCreateButtonClick}>Create Document</button>
        <button onClick={handleDrag}>Drag</button>
        <button onClick={handleShow}>Show</button>
        <button onClick={handleSlide}>Slide</button>
        <button onClick={handleCreateButtonClick}>Create Document</button>
        <Editor
          editorState={editorState}
          onChange={setEditorState}
          handleKeyCommand={handleKeyCommand}
        />
      </div>
    </div>
  );
};

export default WebpageBuilder;
