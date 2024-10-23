import React, { useState } from "react";
import CampaignData from "../models/marketing/Campaign";
import { isNullOrUndefined } from "../security/SanitizationFunctions";
import MarkerComponent from "./MarkerComponent";
import MarkerTimeline from "./MarkerTimeline";
import PlaybackControls from "./PlaybackControls";
import RewindButton from "./RewindButton";
import { VideoData } from "./Video";
import VideoPlayer from "./VideoPlayer";

const VideoManagementUI: React.FC = () => {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignData[]>([]);

  // Method to add a new video
  const addVideo = (newVideo: VideoData) => {
    setVideos(prevVideos => [...prevVideos, newVideo]);
  };

  // Method to remove a video by its ID
  const removeVideo = (videoId: number) => {
    setVideos(prevVideos => prevVideos.filter(video => isNullOrUndefined(video) || video.id !== videoId));
  };

  // Method to add a new campaign
  const addCampaign = (newCampaign: CampaignData) => {
    setCampaigns(prevCampaigns => [...prevCampaigns, newCampaign]);
  };

  // Method to remove a campaign by its ID
  const removeCampaign = (campaignId: number) => {
    setCampaigns(prevCampaigns => prevCampaigns.filter(campaign => isNullOrUndefined(campaign) || campaign.id !== campaignId));
  };


  // Utilize each declared method at least once to set state
  addVideo({
    id: 1,
    title: "Sample Video",
    resolution: "",
    aspectRatio: "",
    language: "",
    subtitles: false,
    duration: 0,
    campaignId: 0,
    status: "pending",
    isActive: false,
    tags: []
  });
  removeVideo(1);
  addCampaign({
    id: 1,
    name: "Sample Campaign",
    description: "",
    startDate: {} as CampaignData["startDate"],
    endDate: {} as CampaignData["endDate"],
  });
  removeCampaign(1);

  // Dummy event handlers for VideoPlayer component
  const handlePlay = () => {};
  const handlePause = () => {};
  const handleRewind = () => {};
  const handleFastForward = () => {};
  const handleVolumeChange = () => {};
  const handleFullScreen = () => {};
  const handleShareScreen = () => {};
  const handleSelectScreen = () => {};
  const handleToggleDualScreen = () => {};
  const handleToggleNotes = () => {};
  const handleTagRevisionPoint = () => {};
  const handleAlertSpaCy = () => {};

  return (
    <div>
      <VideoPlayer
        onPlay={handlePlay}
        onPause={handlePause}
        onRewind={handleRewind}
        onFastForward={handleFastForward}
        onVolumeChange={handleVolumeChange}
        onFullScreen={handleFullScreen}
        onShareScreen={handleShareScreen}
        onSelectScreen={handleSelectScreen}
        onToggleDualScreen={handleToggleDualScreen}
        onToggleNotes={handleToggleNotes}
        onTagRevisionPoint={handleTagRevisionPoint}
        onAlertSpaCy={handleAlertSpaCy}
      />
      <PlaybackControls />
      <RewindButton />
      <MarkerComponent />
      <MarkerTimeline />
    </div>
  );
};

export default VideoManagementUI;
