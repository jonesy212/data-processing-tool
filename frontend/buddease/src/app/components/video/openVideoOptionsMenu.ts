// openVideoOptionsMenu.ts
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import { useContext } from "react";
import { ChatRoomContext, useChatRoom } from "../communications/chat/ChatRoomContext";
import { VideoOptions } from "../communications/chat/ChatSettingsModal";
import { showToast } from "../models/display/ShowToast";
import VideoAPI from "./VideoAPI";
import { VideoActions } from "../users/VideoActions";

const videoId = UniqueIDGenerator.generateVersionNumber(); // Generate a unique video ID
const videoOptions: VideoOptions[] = []; // Provide the list of video options if needed
const roomId = useContext(ChatRoomContext); // Get the room ID from context

export const openVideoOptionsMenu = async (): Promise<VideoOptions | null> => {
  try {
    const videoId = UniqueIDGenerator.generateVersionNumber(); // Generate a unique video ID
    const { roomId } = useChatRoom(); // Get the room ID from context

    // Open video options menu and return selected options
    await VideoAPI.openVideoOptionsMenu(videoOptions, roomId, videoId);

    // Retrieve the selected options using the action creator
    const selectedOptionsAction = VideoActions.getSelectedVideoOptions({ id: videoId });

    // Check if the action contains payload (selected options)
    if ('payload' in selectedOptionsAction) {
      // Extract the payload (selected options)
      const selectedOptions = selectedOptionsAction.payload;
      return selectedOptions;
    } else {
      // If payload is missing, return null
      return null;
    }
  } catch (error) {
    console.error("Error opening video options menu:", error);
    showToast({ content: "Failed to open video options menu" });
    return null;
  }
};
