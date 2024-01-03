import {
  DocumentBuilderConfig,
  getDefaultDocumentBuilderConfig,
} from "@/app/configs/DocumentBuilderConfig";
import "quill/dist/quill.snow.css";
import { useEffect, useState } from "react";
import Quill from "react-quill";
import { ToolbarOptions, ToolbarOptionsProps } from "./ToolbarOptions";
export interface TextEditorProps extends ToolbarOptionsProps {
  id: string;
  fontSize: boolean,
  bold: boolean,
  italic: boolean,
  underline: boolean,
  strike: boolean,
  code: boolean,
  link: boolean,
  image: boolean,
  toolbarOptions: typeof ToolbarOptions;
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

  useEffect(() => {
    if (!quill) {
      try {
        const editor: any = new Quill(
          {
          theme: "snow",
          modules: {
            container: `#${id}-toolbar`,
            toolbar: ToolbarOptions({
              isDocumentEditor: true,
              fontSize,
              bold,
              italic,
              underline,
              strike,
              code,
              link,
              image,
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
  },  [id, fontSize, bold, italic, underline, strike, code, link, image, onChange, quill]);

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
        <ToolbarOptions
          isDocumentEditor={true} 
          isTextCard={false} 
        />
      </div>
      <div id={id} style={{ height: "400px" }} />
    </div>
  );
};

export default TextEditor; 
