// BlogAndContentEditorWrapper.tsx
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import BlogAndContentEditor from './BlogAndContentEditor'; // Import the BlogAndContentEditor component
import { addPostRequest } from './blogActions'; // Import the necessary Redux action

const BlogAndContentEditorWrapper = () => {
  const dispatch = useDispatch();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleTitleChange = (event) => {
    setTitle(event.target.value);
  };

  const handleContentChange = (newContent) => {
    setContent(newContent);
  };

  const handlePublish = () => {
    // Dispatch action to add the post to Redux store
    dispatch(addPostRequest({ title, content, author: 'User', date: new Date() }));
    // Optionally, you can redirect the user to the blog page or show a success message
    // Here, we'll just clear the inputs for demonstration
    setTitle('');
    setContent('');
  };

  return (
    <div>
      <h2>Create or Edit Blog Post</h2>
      <div className="editor-wrapper">
        <label htmlFor="postTitle">Title:</label>
        <input
          type="text"
          id="postTitle"
          value={title}
          onChange={handleTitleChange}
          placeholder="Enter title..."
        />
        <BlogAndContentEditor initialContent={content} onContentChange={handleContentChange} />
        <button onClick={handlePublish}>Publish</button>
      </div>
    </div>
  );
};

export default BlogAndContentEditorWrapper;
