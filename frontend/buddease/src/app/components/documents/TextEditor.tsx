import { DocumentBuilderConfig, getDefaultDocumentBuilderConfig } from '@/app/configs/DocumentBuilderConfig';
import 'quill/dist/quill.snow.css';
import { useEffect, useState } from 'react';
import Quill from 'react-quill';

interface TextEditorProps {
  id: string;
  toolbarOptions: any; // Update the type based on your actual toolbarOptions structure
  onChange?: (content: string) => void;
  documentBuilderConfig?: DocumentBuilderConfig;
}

const TextEditor = ({
  id,
  toolbarOptions,
  onChange,
  documentBuilderConfig = getDefaultDocumentBuilderConfig(),
}: TextEditorProps) => {
  const [quill, setQuill] = useState<Quill | null>(null);

  useEffect(() => {
    if (!quill) {
      const editor = new Quill({
        theme: 'snow',
        modules: {
          toolbar: toolbarOptions
        }
      });

      editor.on("text-change", () => {
        if (onChange) {
          onChange(editor.root.innerHTML);
        }
      });

      setQuill(editor);
    }
  }, [id, toolbarOptions, onChange, quill]);

  useEffect(() => {
    if (quill && documentBuilderConfig) {
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
      <div id={id} style={{ height: "400px" }} />
    </div>
  );
};

export default TextEditor;
