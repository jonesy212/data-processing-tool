import { Editor } from "draft-js";
import SnapshotStore from "../snapshots/SnapshotStore";
import BrowserCheckStore from "../state/stores/BrowserCheckStore";
import { rootStores } from "../state/stores/RootStores";
import useEditorState from "../state/useEditorState";
import { useDispatch } from "react-redux";

const dispatch = useDispatch()
const snapshotStore = new SnapshotStore<any, any>();

const browserConfig: BrowserBehaviorConfig = {
  isAutoDismiss: true, // Example property
  someOtherConfig: 'value', // Add necessary properties here
};
const browserCheckStore = new BrowserCheckStore(rootStores, dispatch, browserConfig, snapshotStore);

const EditorComponent = () => {
  const { editorState, handleEditorStateChange } = useEditorState(browserCheckStore, snapshotStore);

  return (
    <Editor
      editorState={editorState}
      onChange={handleEditorStateChange}
    />
  );
};


export { EditorComponent }