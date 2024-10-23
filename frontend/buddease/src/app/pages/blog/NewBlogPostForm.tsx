// NewBlogPostForm.ts
import { BlogActions } from '@/app/components/models/blogs/BlogAction';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

const NewBlogPostForm: React.FC = () => {
  const dispatch = useDispatch();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };

  const handleContentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Dispatch action to add the new blog post
    dispatch(
      BlogActions.addPostRequest({
        id: 0,
        title,
        content,
        author: 'User', // Assuming the author is the current user
        upvotes: 0,
        createdAt: new Date(), // Set the current date as the creation date
        updatedAt: new Date(),
      })
    );
    // Clear the form fields after submission
    setTitle('');
    setContent('');
  };

  return (
    <div>
      <h2>New Blog Post</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={handleTitleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="content">Content:</label>
          <textarea
            id="content"
            value={content}
            onChange={handleContentChange}
            required
          />
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default NewBlogPostForm;
