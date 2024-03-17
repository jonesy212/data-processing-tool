// BugComments.tsx
import { useState } from 'react';

const BugComments = ({ comments, onAddComment }) => {
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);

  const handleNewCommentChange = (event) => {
    setNewComment(event.target.value);
  };

  const handleReplyTo = (commentId) => {
    setReplyTo(commentId);
  };

  const handleAddComment = () => {
    if (newComment.trim() === '') {
      return; // Prevent adding empty comments
    }
    onAddComment(newComment, replyTo);
    setNewComment('');
    setReplyTo(null);
  };

  return (
    <div>
      <h2>Comments</h2>
      <ul>
        {comments.map((comment) => (
          <li key={comment.id}>
            <div>{comment.text}</div>
            <button onClick={() => handleReplyTo(comment.id)}>Reply</button>
            {/* Render replies here if needed */}
          </li>
        ))}
      </ul>
      <div>
        <textarea
          value={newComment}
          onChange={handleNewCommentChange}
          placeholder="Add a new comment..."
        />
        <button onClick={handleAddComment}>Add Comment</button>
      </div>
    </div>
  );
};

export default BugComments;
