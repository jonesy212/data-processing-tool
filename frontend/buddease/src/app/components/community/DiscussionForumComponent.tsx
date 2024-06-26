// DiscussionForumComponent.tsx

import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import ListGenerator from "@/app/generators/ListGenerator";
import React, { useState } from "react";
import { Comment } from "../models/data/Data";
import { DetailsItem } from "../state/stores/DetailsListStore";
// Define different types of posts


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
  date: Date | undefined;
  timestamp: string | Date;
  createdAt: Date;
  updatedAt: Date;
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
      date: newPost.updatedAt,
      title: newPost.title ?? "",
      content: newPost.content ?? "",
      author: newPost.author ?? "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setPosts([...posts, post]);
    // Reset new post form
    setNewPost({});
  };

  const renderLikes = (likes: string[], likesCount: number) => {
    if (likes.length > 0 && likesCount > likes.length) {
      // Show a few usernames followed by the count
      return (
        <>
          {likes.slice(0, 3).join(", ")} and {likesCount - 3} others like this
        </>
      );
    } else if (likes.length > 0) {
      // Show all usernames
      return likes.join(", ") + " like this";
    } else {
      // No likes
      return "Be the first to like this";
    }
  };

  const handleCommentSubmit = (
    event: React.FormEvent<HTMLFormElement>,
    id?: string,
    title?: string
  ) => {
    event.preventDefault();
    // Create a new comment
    let commentId: string;
    if (id && title) {
      commentId = UniqueIDGenerator.generateCommentID(id, title);
    } else {
      console.error("Id and title are required to generate comment ID");
      return;
    }

    // Determine the type of the author property
    let author: string | undefined;
    if (typeof newComment.author === "string") {
      // Convert author to string if it exists
      author = newComment.author;
    }

    const comment: Comment = {
      ...newComment,
      id: commentId,
      likes: 0, // Assuming you want to start with 0 likes
      text: newComment.content ?? "",
      data: newComment.data, // Assign the data property directly
      author: author, // Assign the determined author value
      customProperty: "", // Add a default value for customProperty
    };

    setComments([...comments, comment]);

    // Reset new comment form
    setNewComment({});
  };

  const transformedPosts: DetailsItem<Post>[] = posts.map((post) => ({
    id: post.id.toString(),
    label: "Post",
    value: JSON.stringify(post),
    updatedAt: post.updatedAt,
    subtitle: post.author,
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
          value={newPost.content ? newPost.content : ""}
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
          value={newComment.content ? newComment.content : ""}
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
export type {  Post };
