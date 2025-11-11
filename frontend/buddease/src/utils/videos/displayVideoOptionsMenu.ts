import { VideoOptions } from "@/app/communications/chat/ChatSettingsModal";
import { VideoActions } from "@/app/users/VideoActions";

// displayVideoOptionsMenu.ts
export const displayVideoOptionsMenu = async (id: string, options: VideoOptions[]) => {
  const selectedOptions =  VideoActions.showOptionsMenu({id,options});
  return selectedOptions;
}