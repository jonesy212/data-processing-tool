// CustomTemplateBuilder.tsx
import { Editor, EditorState, Modifier, RichUtils } from "draft-js";
import React, { useState } from "react";

import { endpoints } from "@/app/api/ApiEndpoints";
import { ChatSettingsPanel } from "@/app/components/communications/chat/ChatSettingsPanel";
import { DocumentTypeEnum } from "@/app/components/documents/DocumentGenerator";
import RichTextEditor from "@/app/components/documents/RichTextEditor";
import {
  ToolbarOptions,
  ToolbarOptionsComponent,
  ToolbarOptionsProps,
} from "@/app/components/documents/ToolbarOptions";
import { getTextBetweenOffsets } from "@/app/components/documents/getTextBetweenOffsets";
import ResizablePanels from "@/app/components/hooks/userInterface/ResizablePanels";
import useResizablePanels from "@/app/components/hooks/userInterface/useResizablePanels";
import { useMovementAnimations } from "@/app/components/libraries/animations/movementAnimations/MovementAnimationActions";
import axiosInstance from "@/app/components/security/csrfToken";
import { usePanelContents } from "@/app/generators/usePanelContents";
import Clipboard from "@/app/ts/clipboard";

interface TemplateDataProps {
  id: number;
  title: string;
  content: string;
}

const API_BASE_URL = endpoints.apiBaseUrl;

const CustomTemplateBuilder: React.FC<TemplateDataProps> = ({
  id,
  title,
  content,
}) => {
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  );
  const { panelSizes, handleResize } = useResizablePanels();
  const { slide, drag, show } = useMovementAnimations();
  const { numPanels, handleNumPanelsChange, panelContents } =
    usePanelContents();

  const handleCreateDocument = async (userOptions: any) => {
    try {
      const contentState = editorState.getCurrentContent();
      const content = contentState.getPlainText();

      const response = await axiosInstance.post(`${API_BASE_URL}/documents`, {
        type: DocumentTypeEnum.Template,
        content,
      });
      console.log("Document created:", response.data);
    } catch (error) {
      console.error("Error creating document:", error);
    }
  };
  const handleKeyCommand = (command: any, state: any) => {
    const newState = RichUtils.handleKeyCommand(state, command);

    if (newState) {
      setEditorState(newState);
      return "handled";
    }
    return "not-handled";
  };

  const handleCopy = () => {
    const selection = editorState.getSelection();
    const currentContent = editorState.getCurrentContent();
    const selectedText = getTextBetweenOffsets(
      currentContent.getPlainText(),
      selection.getStartOffset(),
      selection.getEndOffset()
    );

    console.log("Copied to CustomTemplateBuilder:", selectedText);
  };

  const handlePaste = () => {
    const pastedContent = "Pasted Content";

    console.log("Pasted in CustomTemplateBuilder:", pastedContent);

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

  const handleEditorStateChange = async (
    newEditorState: EditorState
  ): Promise<void> => {
    setEditorState(newEditorState);

    const content = newEditorState.getCurrentContent();
    console.log("New Editor State Content:", content.getPlainText());

    try {
      await axiosInstance.post(`${API_BASE_URL}/addData`, {
        data: content.getPlainText(),
      });

      const response = await axiosInstance.get(`${API_BASE_URL}/list`);
      console.log("Fetched data:", response.data);
    } catch (error) {
      console.error("Error:", error);
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

    // Assuming handleCreateDocument function is defined elsewhere
    handleCreateDocument(userOptions);
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

  // Handler for saving the template
  const handleSaveTemplate = () => {
    const content = editorState.getCurrentContent().getPlainText();
    // Save the template content to the backend or perform other actions
    console.log("Template content:", content);
  };

  return (
    <div>
      <div>
        {/* Render the RichTextEditor component with necessary props */}
        <RichTextEditor
          editorState={editorState}
          onChange={setEditorState}
          // Customize the RichTextEditor based on user requirements
          fontSize={true}
          bold={true}
          italic={true}
          underline={true}
          image={true}
          link={true}
          strikeThrough={undefined}
          highlightColor={undefined}
          alignment={undefined}
          listType={undefined}
          indent={undefined}
          fontColor={undefined}
          fontFamily={undefined}
          imageInsert={undefined}
          linkInsert={undefined}
          undo={undefined}
          redo={undefined}
          // Add more props as needed (e.g., handleKeyCommand, handleCopy, handlePaste)
        />
        <button onClick={handleSaveTemplate}>Save Template</button>
        < ToolbarOptionsComponent
          isDocumentEditor={true}
          fontSize={"16px"}
          bold={true}
          italic={true}
          underline={true}
          strike={true}
          code={true}
          link={true}
          image={true}
          type={DocumentTypeEnum.Template}
          audio={true}
          onEditorStateChange={(newEditorState: any) => {
            setEditorState(newEditorState);
            const content = newEditorState.getCurrentContent();
            console.log("New Editor State Content:", content.getPlainText());
          }}
          handleEditorStateChange={handleEditorStateChange}
        />

        <h1>Custom Template Builder</h1>
        <Clipboard onCopy={handleCopy} onPaste={handlePaste} />
      </div>
      <div>
        <div>
          <h3>Resizable Panels</h3>
          <ResizablePanels
            sizes={panelSizes} // Pass panelSizes directly
            onResize={handleResize}
            onResizeStop={handleResize}
          >
            {panelContents.map((content, index) => (
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
      <ChatSettingsPanel />
    </div>
  );
};

export default CustomTemplateBuilder;
