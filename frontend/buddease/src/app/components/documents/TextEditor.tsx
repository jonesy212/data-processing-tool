import {
  DocumentBuilderConfig,
  getDefaultDocumentBuilderConfig,
} from "@/app/configs/DocumentBuilderConfig";
import DynamicTextArea from "@/app/ts/DynamicTextArea";
import "quill/dist/quill.snow.css";
import { useEffect, useState } from "react";
import Quill from "react-quill";
import { DocumentTypeEnum } from "./DocumentGenerator";
import { ToolbarOptions, ToolbarOptionsProps } from "./ToolbarOptions";
import { getToolbarOptions } from "./documents/ToolbarOptions";
import React from "react";

export interface TextEditorProps extends ToolbarOptionsProps {
  id: string;
  fontSize: string | number | undefined;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strike: boolean;
  code: boolean;
  link: boolean;
  image: boolean;
  toolbarOptions: ToolbarOptions;
  isDocumentEditor?: boolean;
  isTextCard?: boolean;
  onChange?: (content: string) => void;
  documentBuilderConfig?: DocumentBuilderConfig;
}

const TextEditor = ({
  id,
  fontSize,
  bold,
  italic,
  underline,
  strike,
  code,
  link,
  image,
  onChange,
  documentBuilderConfig = getDefaultDocumentBuilderConfig(),
}: TextEditorProps) => {
  const [quill, setQuill] = useState<any | null>(null);
  const [text, setText] = useState("");

  useEffect(() => {
    if (!quill) {
      try {
        const editor: any = new Quill({
          theme: "snow",
          modules: {
            container: `#${id}-toolbar`,
            toolbar: getToolbarOptions({
              isDocumentEditor: true,
              fontSize,
              bold,
              italic,
              underline,
              strike,
              code,
              link,
              image,
              onEditorStateChange: function (newEditorState: any): void {
                setText(newEditorState.getText());
              },
              handleEditorStateChange: function (newEditorState: any): void {
                setText(newEditorState.getText());
              },
              type: DocumentTypeEnum.Text,
            }),
          },
        });

        editor.on("text-change", () => {
          if (onChange) {
            onChange(editor.root.innerHTML);
          }
        });

        setQuill(editor);
      } catch (error) {
        console.error("Error initializing Quill:", error);
      }
    }
  }, [
    id,
    fontSize,
    bold,
    italic,
    underline,
    strike,
    code,
    link,
    image,
    onChange,
    quill,
  ]);

  useEffect(() => {
    if (quill) {
      // Apply document builder configuration to the Quill instance
      // You can customize this based on your configuration structure
      quill.format("font", documentBuilderConfig.fontFamily);
      quill.format("size", documentBuilderConfig.fontSize);
      quill.format("color", documentBuilderConfig.textColor);
      quill.format("background", documentBuilderConfig.backgroundColor);
      // Apply more configurations as needed
    }
  }, [quill, documentBuilderConfig]);

  return (
    <div>
      <div id={`${id}-toolbar`}>
        <ToolbarOptionsComponent
          isDocumentEditor={true}
          isTextCard={false}
          onEditorStateChange={function (newEditorState: any): void {
            setText(newEditorState.getText());
          }}
          handleEditorStateChange={function (newEditorState: any): void {
            setText(newEditorState.getText());
          }}
          type={DocumentTypeEnum.Text}
        />
      </div>
      <div id={id} style={{ height: "400px" }} />
      <DynamicTextArea
        value={text}
        onChange={(newText) => setText(newText)}
        placeholder="Start typing..."
      />
    </div>
  );
};

export default TextEditor;
