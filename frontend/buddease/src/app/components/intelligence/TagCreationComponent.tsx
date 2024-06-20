// TagCreationComponent.ts
import { useDispatch } from 'react-redux';
import { TagOptions } from '../models/tracker/Tag';
import { createTag } from '../state/redux/slices/useTagManagerSlice';

// Example usage in a component or action creator
const TagCreationComponent = () => {
  const dispatch = useDispatch();

  const handleCreateTag = () => {
    const newTagOptions: TagOptions = {
      id: "3", // Generate a unique id here
      name: "New Tag",
      color: "green",
    };
    dispatch(createTag(newTagOptions));
  };

  return (
    <button onClick={handleCreateTag}>Create New Tag</button>
  );
};

export default TagCreationComponent;