import { CommentData, CommentMeta, CommentType } from '@/app/components/models/data/Comments';
import React, { useState } from 'react';

interface Comment<T = CommentData, Meta = CommentMeta, K = CommentType> {
  id: string;
  text: string;
}

interface CommonCommentProps {
  comments: Comment[];
  onAddComment: (text: string, replyTo: string | null) => void;
  onEditComment: (id: string, text: string) => void;
  onDeleteComment: (id: string) => void;
  onReplyToComment: (commentId: string) => void;
  onEditReply: (id: string, text: string) => void;
  onDeleteReply: (id: string) => void;
}

interface BugCommentProps extends CommonCommentProps {
  onEditBug: (id: string, text: string) => void;
  onDeleteBug: (id: string) => void;
  onReplyToBug: (bugId: string) => void;
  onEditReplyToBug: (id: string, text: string) => void;
  onDeleteReplyToBug: (id: string) => void;
}

const BugComments: React.FC<BugCommentProps> = ({
  comments,
  onAddComment,
  onEditComment,
  onDeleteComment,
  onReplyToComment,
  onEditReply,
  onDeleteReply,
  onEditBug,
  onDeleteBug,
  onReplyToBug,
  onEditReplyToBug,
  onDeleteReplyToBug,
}) => {
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);

  const handleNewCommentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewComment(event.target.value);
  };

  const handleReplyTo = (commentId: string) => {
    setReplyTo(commentId);
    onReplyToComment(commentId);
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
      {comments.length > 0 ? (
        <ul>
          {comments.map((comment) => (
            <li key={comment.id}>
              <div>{comment.text}</div>
              <button onClick={() => handleReplyTo(comment.id)}>Reply</button>
              {/* Render replies here if needed */}
            </li>
          ))}
        </ul>
      ) : (
        <p>No comments available.</p>
      )}
      <div>
        <textarea
          value={newComment}
          onChange={handleNewCommentChange}
          placeholder="Add a new comment..."
        />
        <button onClick={handleAddComment}>Add Comment</button>
        {comments.length > 0 && (
          <>
            <button onClick={handleAddComment}>Add Reply</button>
            <button onClick={handleAddComment}>Edit Comment</button>
            <button onClick={handleAddComment}>Edit Reply</button>
            <button onClick={handleAddComment}>Delete Comment</button>
          </>
        )}
      </div>
    </div>
  );
};

export default BugComments;
