// RichTextEditor.jsx
import 'quill/dist/quill.snow.css';
import { useEffect, useState } from 'react';
import Quill from 'react-quill';
import { sanitizeData } from './SanitizationFunctions'; // Import the sanitizeData function

const RichTextEditor = ({ onChange }) => {
  const [quill, setQuill] = useState(null);

  useEffect(() => {
    if (!quill) {
      try {
        const editor = new Quill('#editor', {
          theme: 'snow',
        });

        editor.on('text-change', () => {
          if (onChange) {
            const sanitizedContent = sanitizeData(editor.root.innerHTML); // Sanitize the content
            onChange(editor.root.innerHTML);
          }
        });

        setQuill(editor);
      } catch (error) {
        console.error('Error initializing Quill:', error);
      }
    }
  }, [quill, onChange]);

  return <div id="editor" style={{ height: '400px' }} />;
};

export default RichTextEditor;
