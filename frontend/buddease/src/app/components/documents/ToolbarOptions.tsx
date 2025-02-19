import { DraftInlineStyle, EditorState, RichUtils } from "draft-js";
import React, { useState } from "react";
import { ThemeConfigProps } from "../hooks/userInterface/ThemeConfigContext";
import CustomModifier from "./CustomModifier";
import { DocumentTypeEnum } from "./DocumentGenerator";
import ToolbarItem from "./ToolbarItem";
import { toolbarOptions } from "./Toolbar";


// Define a new type for the toolbar options
type ToolbarOptions = {
  [key in keyof typeof toolbarOptions]: string[];
} & { calendar: boolean | string[] };



interface BaseFormattingOptions {
  fontSize?: number | string;
  margin?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  textColor?: string;
  backgroundColor?: string;
  fontFamily?: string;
}

interface TextFormattingOptions extends BaseFormattingOptions {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  code?: boolean;
  link?: boolean;
  image?: boolean;
  audio?: boolean;
}



interface ToolbarOptionsProps extends TextFormattingOptions {
  isDocumentEditor?: boolean;
  isTextCard?: boolean;
  type: DocumentTypeEnum;
  onEditorStateChange: (newEditorState: any) => void;
  handleEditorStateChange: (newEditorState: EditorState) => void;
}


const ToolbarOptionsComponent: React.FC<ToolbarOptionsProps> = ({
  isDocumentEditor,
  isTextCard,
  audio,
  fontSize,
  bold,
  italic,
  underline,
  strike,
  code,
  link,
  image,
  onEditorStateChange,
  handleEditorStateChange
}) => {
  interface Options {
    [key: string]: string[];
  }

  let options: Options = {};

  const [editorState, setEditorState] = useState(() => {
    // Initialize the editor state (you can modify this based on your requirements)
    return EditorState.createEmpty();
  });

  const handleFontSizeChange = (newFontSize: ThemeConfigProps["fontSize"]) => {
    // Placeholder logic for font size change
    // Replace this with your actual implementation
    const currentContent = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    
    const newContentState = CustomModifier.setInlineStyle(
      currentContent,
      selection,
      newFontSize as unknown as DraftInlineStyle
    );

    const newEditorState = EditorState.push(
      editorState,
      newContentState,
      "change-inline-style"
    );


    // Updated function call
    handleEditorStateChange(newEditorState);

    onEditorStateChange(newEditorState);
  };

  const handleItalicClick = () => {
    // Toggle italic style in the editor state
    const newEditorState = RichUtils.toggleInlineStyle(editorState, "ITALIC");
    // Updated function call
    handleEditorStateChange(newEditorState);
  };

  const handleUnderlineClick = () => {
    // Toggle italic style in the editor state
    const newEditorState = RichUtils.toggleInlineStyle(editorState, "underline");
    // Updated function call
    handleEditorStateChange(newEditorState);
  };
  
 
  const handleBoldClick = () => {
    // Toggle bold style in the editor state
    const newEditorState = RichUtils.toggleInlineStyle(editorState, "BOLD");
    // Update the editor state in DocumentBuilder
    onEditorStateChange(newEditorState);
  };
 
  const handleStrikeClick = () => {
    // Toggle bold style in the editor state
    const newEditorState = RichUtils.toggleInlineStyle(editorState, "strike");
    // Update the editor state in DocumentBuilder
    onEditorStateChange(newEditorState);
  };
 
  const handleCodeClick = () => {
    // Toggle bold style in the editor state
    const newEditorState = RichUtils.toggleInlineStyle(editorState, "strike");
    // Update the editor state in DocumentBuilder
    onEditorStateChange(newEditorState);
  };

  const handleLinkClick = () => {
    // Toggle bold style in the editor state
    const newEditorState = RichUtils.toggleInlineStyle(editorState, "strike");
    // Update the editor state in DocumentBuilder
    onEditorStateChange(newEditorState);
  };

  const handleImageClick = () => {
    // Toggle bold style in the editor state
    const newEditorState = RichUtils.toggleInlineStyle(editorState, "strike");
    // Update the editor state in DocumentBuilder
    onEditorStateChange(newEditorState);
  };

  const addOptions = (property: string, propertyOptions: string[]) => {
    if (property) {
      options = {
        ...options,
        [`${property}Options`]: propertyOptions,
      };
    }
  };

  if (isDocumentEditor) {
    options = {
      documentOptions: ["bold", "italic", "underline", "strike"],
      alignmentOptions: ["align", "center", "right"],
      colorOptions: ["color", "background"],
      listOptions: ["list", "bullet", "ordered"],
      headingOptions: ["header", "1", "2", "3", "4", "5", "6"],
      linkOptions: ["link", "image", "video", "audio"],
    };
  } else if (isTextCard) {
    options = {
      textCardOptions: ["align", "color", "italic"],
    };

    addOptions("fontSize", ["fontSize"]);
    addOptions("bold", ["bold"]);
    addOptions("italic", ["italic"]);
    addOptions("underline", ["underline"]);
    addOptions("strike", ["strike"]);
    addOptions("code", ["code"]);
    addOptions("link", ["link"]);
    addOptions("image", ["image"]);
    // Add more properties/options as needed
  }

  return (
    <div>
    {Object.keys(options).map((key) => (
      <ul key={key}>
        {options[key].map((option: string) => (
          <ToolbarItem
            key={option}
            id={option}
            label={option.charAt(0).toUpperCase() + option.slice(1)}
            onClick={() => {
              // Handle onClick logic for each toolbar item
              switch (option) {
                case "bold":
                  handleBoldClick();
                  break;
                case "italic":
                  handleItalicClick();
                  break;
                case "underline":
                  handleUnderlineClick();
                  break;
                case "strike":
                  handleStrikeClick();
                  break;
                case "code":
                  handleCodeClick();
                  break;
                case "link":
                  handleLinkClick();
                  break;
                case "image":
                  handleImageClick();
                  break;
                // Add cases for additional options if needed
                default:
                  break;
              }
            }}
          />
        ))}
      </ul>
    ))}
    {fontSize && (
      <ToolbarItem
        id="fontSize"
        label="Change Font Size"
        onClick={() => handleFontSizeChange("yourFontSizeValue")}
      />
    )}
    {/* Add buttons or controls for other formatting options */}
  </div>

  );
}; 

export { ToolbarOptionsComponent }
export type { BaseFormattingOptions, ToolbarOptions, ToolbarOptionsProps };
