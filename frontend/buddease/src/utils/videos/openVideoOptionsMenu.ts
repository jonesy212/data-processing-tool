// openVideoOptionsMenu.ts
import UniqueIDGenerator from '@/app/generators/GenerateUniqueIds';
import { useContext } from 'react';
import { ChatRoomContext, useChatRoom } from '@/app/components/communications/chat/ChatRoomContext'
import { VideoOptions } from '@/app/cards/modal/ChatSettingsModal';
import { showToast } from '@/app/models/display/ShowToast';
import VideoAPI from '@/app/api/videos/VideoAPI';
import { VideoActions } from '@/app/actions/VideoActions';

const videoOptions: VideoOptions = {
  enableVideo: false,
  videoInputDevice: 'default',
};
const roomId = useContext(ChatRoomContext); // Get the room ID from context

export const openVideoOptionsMenu = async (): Promise<VideoOptions | null> => {
  try {
    const videoId = UniqueIDGenerator.generateVersionNumber(); // Generate a unique video ID
    const { roomId } = useChatRoom(); // Get the room ID from context

    // Open video options menu and return selected options
    await VideoAPI.openVideoOptionsMenu(videoOptions, roomId, videoId);

    // Retrieve the selected options using the action creator
    const selected: VideoOptions = {
      id: videoId,
      enableVideo: videoOptions.enableVideo ?? false,
      videoInputDevice: videoOptions.videoInputDevice ?? 'default',
    };

    // 2. dispatch
    const selectedOptionsAction = VideoActions.getSelectedVideoOptions(selected);
    return selectedOptionsAction.payload;

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
}
