// BlogAndContentEditorWrapper.tsx
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import BlogAndContentEditor from './BlogAndContentEditor'; // Import the BlogAndContentEditor component
import { BlogActions } from '../blogs/BlogAction';
import { blogApiService } from '@/app/api/BlogAPI';
import { ContentItem } from './ContentItem';
import ContentType from '../../typings/ContentType';

const BlogAndContentEditorWrapper = () => {
  const dispatch = useDispatch();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleTitleChange = (event: any) => {
    setTitle(event.target.value);
  };

  const handleContentChange = (newContent: ContentType) => {
    setContent(newContent);
  };

  const handlePublish = () => {
    // Dispatch action to add the post to Redux store
    dispatch(BlogActions.addPostRequest({
      id: blogId,
      title,
      content,
      author: 'User',
      date: new Date(),
      upvotes: 0,
    }));
    // Optionally, you can redirect the user to the blog page or show a success message
    // Here, we'll just clear the inputs for demonstration
    setTitle('');
    setContent('');
  };

  // Define an array of content types with their respective labels
  const contentTypes = [
    { label: 'Text', value: 'text' },
    { label: 'Image', value: 'image' },
    // Add more content types as needed
  ];

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
        {/* Render content editors for each content type */}
        {contentTypes.map((contentType) => (
          <div key={contentType.value}>
            <label htmlFor={`postContent_${contentType.value}`}>{contentType.label}:</label>
            <BlogAndContentEditor
              contentItemId={`postContent_${contentType.value}`}
              initialContent={content}
              onContentChange={handleContentChange}
              contentType={contentType.value} // Pass the content type to the editor
            />
          </div>
        ))}
        <button onClick={handlePublish}>Publish</button>
      </div>
    </div>
  );
};

export default BlogAndContentEditorWrapper;
