// openAudioOptionsMenu.ts

import { ChatApi } from "@/app/api/ChatApi";
import { showToast } from "@/app/components/models/display/ShowToast";

// Function to open audio options menu
const openAudioOptionsMenu = async (roomId: string) => {
  try {
    // Simulate fetching audio options from an API or local storage
    const audioOptions = await ChatApi.fetchAudioOptions(roomId);
    // Display the audio options menu with the fetched options
    const selectedOptions = await ChatApi.displayAudioOptionsMenu(audioOptions);
    console.log("Selected audio options:", selectedOptions);
    return selectedOptions;
  } catch (error) {
    console.error("Error opening audio options menu:", error);
    // Handle errors if fetching or displaying options fails
    // For example, show an error message to the user
    showToast({
      content: "Failed to open audio options menu. Please try again later.",
    });
    return null;
  }
};

export default openAudioOptionsMenu;
