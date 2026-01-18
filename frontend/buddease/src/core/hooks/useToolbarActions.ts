// useToolbarActions.ts
app/communications/documents/hooks/useToolbarActions.ts
import { ToolbarActions } from '@/core/actions/ToolbarActions';
import { EditorState, RichUtils } from 'draft-js';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

interface UseToolbarActionsProps {
  editorState: EditorState;
  onEditorStateChange: (state: EditorState) => void;
  handleEditorStateChange: (state: EditorState) => void;
}

export const useToolbarActions = ({
  editorState,
  onEditorStateChange,
  handleEditorStateChange
}: UseToolbarActionsProps) => {
  const dispatch = useDispatch();

  const handleBoldClick = useCallback(() => {
    const newEditorState = RichUtils.toggleInlineStyle(editorState, 'BOLD');
    handleEditorStateChange(newEditorState);
    dispatch(ToolbarActions.updateSelectedOption('bold'));
  }, [editorState, handleEditorStateChange, dispatch]);

  const handleItalicClick = useCallback(() => {
    const newEditorState = RichUtils.toggleInlineStyle(editorState, 'ITALIC');
    handleEditorStateChange(newEditorState);
    dispatch(ToolbarActions.updateSelectedOption('italic'));
  }, [editorState, handleEditorStateChange, dispatch]);

  const handleUnderlineClick = useCallback(() => {
    const newEditorState = RichUtils.toggleInlineStyle(editorState, 'UNDERLINE');
    handleEditorStateChange(newEditorState);
    dispatch(ToolbarActions.updateSelectedOption('underline'));
  }, [editorState, handleEditorStateChange, dispatch]);

  const handleStrikeClick = useCallback(() => {
    const newEditorState = RichUtils.toggleInlineStyle(editorState, 'STRIKETHROUGH');
    handleEditorStateChange(newEditorState);
    dispatch(ToolbarActions.updateSelectedOption('strike'));
  }, [editorState, handleEditorStateChange, dispatch]);

  const handleCodeClick = useCallback(() => {
    const newEditorState = RichUtils.toggleInlineStyle(editorState, 'CODE');
    handleEditorStateChange(newEditorState);
    dispatch(ToolbarActions.updateSelectedOption('code'));
  }, [editorState, handleEditorStateChange, dispatch]);

  const handleLinkClick = useCallback(() => {
    // For link, you might want to show a modal instead of toggling inline style
    dispatch(ToolbarActions.updateSelectedOption('link'));
    dispatch(ToolbarActions.showToolbar());
  }, [dispatch]);

  const handleImageClick = useCallback(() => {
    dispatch(ToolbarActions.updateSelectedOption('image'));
    dispatch(ToolbarActions.showToolbar());
  }, [dispatch]);

  const handleFontSizeChange = useCallback((fontSize: string) => {
    // Your existing font size logic here
    const currentContent = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    
    // Your CustomModifier logic...
    
    dispatch(ToolbarActions.updateSelectedOption(`fontSize-${fontSize}`));
  }, [editorState, dispatch]);

  // Document-specific toolbar actions
  const handleAlignmentChange = useCallback((alignment: string) => {
    dispatch(ToolbarActions.updateSelectedOption(`align-${alignment}`));
    // Add your alignment logic here
  }, [dispatch]);

  const handleColorChange = useCallback((colorType: 'color' | 'background', color: string) => {
    dispatch(ToolbarActions.updateSelectedOption(`${colorType}-${color}`));
    // Add your color logic here
  }, [dispatch]);

  // Feature toggles for document editor
  const toggleDocumentFeature = useCallback((feature: string, enabled: boolean) => {
    dispatch(ToolbarActions.toggleFeature({
      userId: 'current', // You might want to pass actual user here
      feature: `document-${feature}`,
      isEnabled: enabled
    }));
  }, [dispatch]);

  return {
    // Text formatting actions
    handleBoldClick,
    handleItalicClick,
    handleUnderlineClick,
    handleStrikeClick,
    handleCodeClick,
    handleLinkClick,
    handleImageClick,
    handleFontSizeChange,
    
    // Document-specific actions
    handleAlignmentChange,
    handleColorChange,
    toggleDocumentFeature,
    
    // Toolbar state management
    showToolbar: () => dispatch(ToolbarActions.showToolbar()),
    hideToolbar: () => dispatch(ToolbarActions.hideToolbar()),
    resetToolbar: () => dispatch(ToolbarActions.resetToolbarState()),
  };
};