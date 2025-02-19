// BlogEditor.tsx

import React from 'react';

import TextEditor from '../../documents/TextEditor';

import { DocumentType } from '../../documents/DocumentGenerator';
 
const BlogEditor: React.FC = () => {
  return (
    <div>
      <h1>Blog Editor</h1>
      <TextEditor
        id="blog-editor"
        fontSize={true}
        bold={true}
        italic={true}
        underline={true}
        strike={true}
        code={true}
        link={true}
        image={true}
        onChange={(content: string) => {
          console.log('Content:', content);
          // You can handle the content change here
        }}
        toolbarOptions={undefined}
        type={DocumentType.Text} onEditorStateChange={function (newEditorState: any): void {
          throw new Error('Function not implemented.');
        }}
        handleEditorStateChange={function (newEditorState: Draft.EditorState): void {
          throw new Error('Function not implemented.');
        } }      />
    </div>
  );
};

export default BlogEditor;