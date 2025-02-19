
// Example function to get the document name
const getDocumentNameFromEditorState = (editorState) => {
  const contentState = editorState.getCurrentContent();
  const plainText = contentState.getPlainText();

  // Here you might have custom logic to derive the document name from the content
  // For demonstration, we use the first line of the plain text as the document name
  const firstLine = plainText.split('\n')[0].trim();
  
  return firstLine || 'Untitled Document';
};

export {getDocumentNameFromEditorState}