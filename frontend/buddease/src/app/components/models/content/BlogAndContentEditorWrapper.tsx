// BlogAndContentEditorWrapper.tsx
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import BlogAndContentEditor from './BlogAndContentEditor'; // Import the BlogAndContentEditor component
import { BlogActions } from '../blogs/BlogAction';
import { blogApiService } from '@/app/api/BlogAPI';
import { ContentItem } from './ContentItem';
import ContentType from '../../typings/ContentType';
import UniqueIDGenerator from '@/app/generators/GenerateUniqueIds';
import { EditorState } from 'draft-js';

const BlogAndContentEditorWrapper = async () => {
  const dispatch = useDispatch();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleTitleChange = (event: any) => {
    setTitle(event.target.value);
  };

  const handleContentChange = (newContent: ContentType) => {
    setContent(newContent);
  };



  const fetchBlogName = async () => {
    let blogId;
    const response = await blogApiService.fetchBlog(blogId);
    const blogName = response.data;
    blogId = UniqueIDGenerator.generateBlogPostID(blogName);
    return blogId;
  };
    
  
  const blogId = await fetchBlogName(); // Move the usage of blogId below its declaration

  
  const handlePublish = async () => {
    const blogId = await fetchBlogName();
    dispatch(
      BlogActions.addPostRequest({
        id: Number(blogId),
        title,
        content,
        author: "User",
        date: new Date(),
        upvotes: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    );
    setTitle("");
    setContent("");
  };

  const contentTypes = [
    { label: "Text", value: "text" },
    { label: "Image", value: "image" },
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
        {contentTypes.map((contentType) => (
          <div key={contentType.value}>
            <label htmlFor={`postContent_${contentType.value}`}>
              {contentType.label}:
            </label>
            <BlogAndContentEditor
              contentItemId={`postContent_${contentType.value}`}
              initialContent={content}
              onContentChange={handleContentChange}
              contentType={contentType = {
                label: "Plain Text",
                value:  "plaintext"
              }} editorState={new EditorState} activeDashboard={'tasks'}            />
          </div>
        ))}
        <button onClick={handlePublish}>Publish</button>
      </div>
    </div>
  );
};

export default BlogAndContentEditorWrapper;
