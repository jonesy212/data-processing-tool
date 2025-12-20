import { VideoOptions } from "@/app/cards/modal/ChatSettingsModal";
import { VideoActions } from "@/app/actions/VideoActions";

// displayVideoOptionsMenu.ts
export const displayVideoOptionsMenu = async (id: string, options: VideoOptions[]) => {
  const selectedOptions =  VideoActions.showOptionsMenu({id,options});
  return selectedOptions;
}