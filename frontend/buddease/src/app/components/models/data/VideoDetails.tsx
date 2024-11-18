// VideoDetails.tsx
import { Todo } from "../../todos/Todo";
import * as React from 'react'
import { VideoData } from "../../video/Video";

interface VideoDetailsProps {
  videoData: VideoData
}

const VideoDetails: React.FC<VideoDetailsProps> = ({ videoData }) => {
  if (!videoData) {
    return null;
  }

  return (
    <div className="video-details">
      <h3>Video Details</h3>
      <p>Title: {videoData.title}</p>
      <p>Description: {videoData.description}</p>
      <p>Duration: {videoData.duration} seconds</p>
      <p>Resolution: {videoData.resolution}</p>
      <p>Uploaded By: {videoData.uploadedBy}</p>
      <p>Views Count: {videoData.viewsCount}</p>
      <p>Likes Count: {videoData.likesCount}</p>
      <p>Dislikes Count: {videoData.dislikesCount}</p>
      <p>Comments Count: {videoData.commentsCount}</p>
      {/* Add more video details as needed */}
    </div>
  );
};


export default VideoDetails;
