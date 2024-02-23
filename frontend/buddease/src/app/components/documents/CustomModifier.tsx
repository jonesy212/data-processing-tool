import { ContentBlock, ContentState, DraftInlineStyle, EditorState, Modifier, SelectionState } from "draft-js";
import { ThemeConfigProps } from "../hooks/userInterface/ThemeConfigContext";

class CustomModifier extends Modifier {
  static setInlineStyle(
    contentState: ContentState,
    selectionState: SelectionState,
    inlineStyle: DraftInlineStyle
  ): ContentState {
    const blockMap = contentState.getBlockMap();
    const startKey = selectionState.getStartKey();
    const endKey = selectionState.getEndKey();
    const startOffset = selectionState.getStartOffset();
    const endOffset: number = selectionState.getEndOffset(); // Declare endOffset variable

    let newBlockMap = blockMap;

    blockMap.forEach((block) => {
      const key = block?.getKey();

      // Check if the block is defined and within the selection range
      if (
        block &&
        ((key === startKey && key === endKey) ||
        (key === startKey && block.getLength() >= endOffset) ||
        (key === endKey && block.getLength() <= endOffset))
      ) {
        const chars = block?.getInlineStyleAt(startOffset);

        const newChars = chars?.merge(inlineStyle);

        const newBlock = block?.merge({ inlineStyle: newChars }) as ContentBlock;

        newBlockMap = newBlockMap.set(key as string, newBlock);
      }
    });

    return ContentState.createFromBlockArray(newBlockMap.toArray());
  }
}

// Now you can use CustomModifier.setInlineStyle in your component
// Assuming editorState and onEditorStateChange are defined in the same scope

// Now you can use CustomModifier.setInlineStyle in your component
const handleFontSizeChange = (newFontSize: ThemeConfigProps["fontSize"], editorState: EditorState, onEditorStateChange: (editorState: EditorState) => void) => {
  const currentContent = editorState.getCurrentContent();
  const selection = editorState.getSelection();
  
  const fontSizeStyle: DraftInlineStyle = newFontSize as unknown as DraftInlineStyle;

  // Use the custom setInlineStyle method
  const newContentState = CustomModifier.setInlineStyle(
    currentContent,
    selection,
    fontSizeStyle
  );

  const newEditorState = EditorState.push(
    editorState,
    newContentState,
    "change-inline-style"
  );

  onEditorStateChange(newEditorState);
};


// Define editorState and onEditorStateChange
let editorState: EditorState = EditorState.createEmpty(); // Initialize the editor state
const onEditorStateChange = (newEditorState: EditorState) => {
  // Update the editor state
  editorState = newEditorState;
};

// Define the new font size
const newFontSize = "16px"; // Example font size

// Call handleFontSizeChange with the appropriate arguments
handleFontSizeChange(newFontSize, editorState, onEditorStateChange);

export default CustomModifier;