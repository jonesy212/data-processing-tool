import { ContentBlock, ContentState, DraftInlineStyle, EditorState, Modifier, SelectionState } from "draft-js";
import { ThemeConfigProps } from "../hooks/userInterface/ThemeConfigContext";

// Extend the Modifier object to include setInlineStyle method
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
      const endOffset = selectionState.getEndOffset();
  
      let newContentState = contentState;
  
      blockMap.forEach((block) => {
        const key = block?.getKey();
        let newBlock = block;
  
        if (key === startKey || key === endKey) {
          const chars = block?.getInlineStyleAt(startOffset);
  
          const newChars = chars?.merge(inlineStyle);
  
          newBlock = newBlock?.getInlineStyleAt(startOffset, newChars)
        }
  
        newContentState = newContentState.set("blockMap", blockMap.set(key as string, newBlock as ContentBlock));
      });
  
      return newContentState;
    }
  }
  

// Now you can use CustomModifier.setInlineStyle in your component
const handleFontSizeChange = (newFontSize: ThemeConfigProps["fontSize"]) => {
  const currentContent = editorState.getCurrentContent();
  const selection = editorState.getSelection();

  // Use the custom setInlineStyle method
  const newContentState = CustomModifier.setInlineStyle(
    currentContent,
    selection,
    newFontSize
  );

  const newEditorState = EditorState.push(
    editorState,
    newContentState,
    "change-inline-style"
  );

  onEditorStateChange(newEditorState);
};

export default CustomModifier