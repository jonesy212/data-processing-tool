// RichTextEditor.jsx
import 'quill/dist/quill.snow.css';
import { useEffect, useState } from 'react';
import Quill from 'react-quill';
import { sanitizeData } from '../security/SanitizationFunctions';

const RichTextEditor = ({ editorState, onChange, fontSize, bold, italic, underline, image, link, strikeThrough, highlightColor, alignment, listType, indent, fontColor, fontFamily, imageInsert, linkInsert, undo, redo }) => {
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
            onChange(sanitizedContent); // Use sanitized content
          }
        });

        setQuill(editor);
      } catch (error) {
        console.error('Error initializing Quill:', error);
      }
    }
  }, [quill, onChange, editorState]);


  useEffect(() => {
    // Apply text formatting options based on props
    if (quill) {
      const format = quill.getFormat();
      quill.format('font', { size: fontSize });
      quill.format('bold', bold);
      quill.format('italic', italic);
      quill.format('underline', underline);
      quill.format('image', image);
      quill.format('strike', strikeThrough);
      quill.format('background', highlightColor);
      quill.format('align', alignment);
      quill.format(listType === 'bullet' ? 'list' : 'indent', listType);
      quill.format('indent', indent ? '+1' : '-1');
      quill.format('color', fontColor);
      quill.format('font', fontFamily);
      quill.format('link', link)
    }
  }, [quill, fontSize, bold, italic, underline, image, strikeThrough, highlightColor,link, alignment, listType, indent, fontColor, fontFamily]);



  useEffect(() => {
    // Perform specific actions based on props
    if (quill) {
      if (imageInsert) {
        // Logic for handling image insertion
        quill.format('image', imageInsert);
      }
      if (linkInsert) {
        // Logic for handling link insertion
        quill.format('link', linkInsert);
      }
      if (undo) {
        quill.history.undo();
      }
      if (redo) {
        quill.history.redo();
      }
    }
  }, [quill, imageInsert, linkInsert, undo, redo]);

  return <div id="editor" style={{ height: '400px' }} />;
};

export default RichTextEditor;
