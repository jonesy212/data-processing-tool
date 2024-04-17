// DiscussionForumComponent.tsx

import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import ListGenerator from "@/app/generators/ListGenerator";
import React, { useState } from "react";
import { Comment } from "../models/data/Data";
import { DetailsItem } from "../state/stores/DetailsListStore";
// Define different types of posts
interface BlogPost extends Post {
  // Additional properties specific to BlogPost
}

interface ChatPost extends Post {
  // Additional properties specific to ChatPost
}

// Define different types of comments
interface BlogComment extends Comment {
  // Additional properties specific to BlogComment
}

interface ChatComment extends Comment {
  // Additional properties specific to ChatComment
}

interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  upvotes: number;
}


const DiscussionForumComponent: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newPost, setNewPost] = useState<Partial<Post>>({});
  const [newComment, setNewComment] = useState<Partial<Comment>>({});

  const handlePostSubmit = () => {
    // Create a new post
    const postId = posts.length + 1;
    const post: Post = {
      ...newPost,
      id: postId,
      upvotes: 0,
      title: newPost.title ?? "",
      content: newPost.content ?? "",
      author: newPost.author ?? "",
    };
    setPosts([...posts, post]);
    // Reset new post form
    setNewPost({});
  };

  const handleCommentSubmit = () => {
    // Create a new comment
    const commentId = UniqueIDGenerator.generateCommentID()
    const comment: Comment = {
      ...newComment,
      id: commentId,
      upvotes: 0,
      text: newComment.text ?? "",
      data: newComment.data ?? "",
    };
    
    setComments([...comments, comment]);

    // Reset new comment form
    setNewComment({});
  };



  const transformedPosts: DetailsItem<Post>[] = posts.map((post) => ({
    id: post.id.toString(),
    label: "Post",
    value: JSON.stringify(post),
    
  }));




  return (
    <div>
      <h2>Discussion Forum</h2>
      {/* New Post Form */}
      <form onSubmit={handlePostSubmit}>
        <input
          type="text"
          placeholder="Title"
          value={newPost.title || ""}
          onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
        />
        <textarea
          placeholder="Content"
          value={newPost.content || ""}
          onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
        />
        <input
          type="text"
          placeholder="Author"
          value={newPost.author || ""}
          onChange={(e) => setNewPost({ ...newPost, author: e.target.value })}
        />
        <button type="submit">Create Post</button>
      </form>

      {/* New Comment Form */}
      <form onSubmit={handleCommentSubmit}>
        <input
          type="text"
          placeholder="Your Name"
          value={newComment.author || ""}
          onChange={(e) =>
            setNewComment({ ...newComment, author: e.target.value })
          }
        />
        <textarea
          placeholder="Your Comment"
          value={newComment.content || ""}
          onChange={(e) =>
            setNewComment({ ...newComment, content: e.target.value })
          }
        />
        <button type="submit">Add Comment</button>
      </form>

      {/* Display Posts */}
      <div>
      <ListGenerator items={transformedPosts} />
      {/* Display Comments */}
      {posts.map((post) => (
        <div key={post.id}>
          <h3>{post.title}</h3>
          <p>{post.content}</p>
          <p>Author: {post.author}</p>
          <p>Upvotes: {post.upvotes}</p>
          <ul>
            {comments
              .filter((comment) => comment.postId === post.id)
              .map((comment) => (
                <li key={comment.id}>
                  <p>{comment.content}</p>
                  <p>Author: {comment.author}</p>
                  <p>Upvotes: {comment.upvotes}</p>
                </li>
              ))}
          </ul>
        </div>
      ))}
      </div>
    </div>
  );

};

export default DiscussionForumComponent;
export type {BlogPost}