// useEditorState.ts
import { useState, useEffect } from 'react';
import { EditorState } from 'draft-js';
import BrowserCheckStore from '@/app/components/state/stores/BrowserCheckStore'
import SnapshotStore from '@/app/components/snapshots/SnapshotStore'; 
import BrowserBehaviorManager from '@/app/components/state/BrowserBehaviorManager'; 

// Custom hook for editor state management
const useEditorState = (
  browserCheckStore: BrowserCheckStore,  // Inject BrowserCheckStore
  snapshotStore: SnapshotStore<any, any> // Inject SnapshotStore for snapshot management
) => {
  // Initialize editor state
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());

  // Handle editor state changes and save snapshots based on browser behavior
  const handleEditorStateChange = (newEditorState: EditorState) => {
    setEditorState(newEditorState);

    // Save a snapshot when the editor state changes
    if (browserCheckStore) {
      browserCheckStore.saveBrowserSnapshot({
        content: newEditorState.getCurrentContent().getPlainText(),
        timestamp: new Date().toISOString(),
        browserType: browserCheckStore.browserBehaviorManager.getBrowserType(),
        isMobile: browserCheckStore.browserBehaviorManager.isMobile(),
      });
    }
  };

  useEffect(() => {
    // Example: Automatically save editor state at regular intervals if auto-save is enabled
    if (browserCheckStore.browserBehaviorManager.getConfig().isAutoDismiss) {
      const intervalId = setInterval(() => {
        console.log('Auto-saving editor state...');
        handleEditorStateChange(editorState); // Trigger save
      }, 5000); // Save every 5 seconds

      return () => clearInterval(intervalId); // Cleanup on unmount
    }
  }, [editorState, browserCheckStore]);

  return {
    editorState,
    handleEditorStateChange,
  };
};

export default useEditorState;
