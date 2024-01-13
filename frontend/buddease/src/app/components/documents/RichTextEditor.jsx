// RichTextEditor.jsx
import 'quill/dist/quill.snow.css';
import React, { useEffect, useState } from 'react';
import Quill from 'react-quill';

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
