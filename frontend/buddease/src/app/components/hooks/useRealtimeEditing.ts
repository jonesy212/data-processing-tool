import { ContentState, EditorState } from 'draft-js';
import { useCallback, useEffect, useState } from 'react';
import useWebSocket from './useWebSocket'; // Custom hook for managing WebSocket connections
import useEditorState from '../state/useEditorState';

const useRealtimeEditing = (documentId: any) => {
  const { editorState: initialEditorState, handleEditorStateChange } = useEditorState();

  const [editorState, setEditorState] = useState(initialEditorState);
  const { sendWebSocketMessage }: { sendWebSocketMessage: any } = useWebSocket(documentId);

  useEffect(() => {
    const handleIncomingMessage = (incomingChange: EditorState) => {
      handleEditorStateChange(applyChange(editorState, incomingChange));
    };

    sendWebSocketMessage('subscribeToDocumentChanges', handleIncomingMessage);

    return () => {
      sendWebSocketMessage('unsubscribeFromDocumentChanges');
    };
  }, [documentId, handleEditorStateChange, editorState, sendWebSocketMessage]);

  const applyChange = useCallback((currentContentState: ContentState, change: { position: number; newText: string }) => {
    const { newText } = change;
    const newContentState = ContentState.createFromText(newText);
    return currentContentState.merge(newContentState);
  }, []);

  const sendChange = useCallback((position: number, newText: string) => {
    sendWebSocketMessage('sendDocumentChange', { position, newText });
  }, [sendWebSocketMessage]);

  return { editorState, sendChange };
};

export default useRealtimeEditing;
