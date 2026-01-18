// displayVideoOptionsMenu.ts
import { VideoActions } from "@/core/actions/VideoActions";
import { VideoOptions } from "@/core/cards/modal/ChatSettingsModal";

export const displayVideoOptionsMenu = async (id: string, options: VideoOptions[]) => {
  const selectedOptions =  VideoActions.showOptionsMenu({id,options});
  return selectedOptions;
}