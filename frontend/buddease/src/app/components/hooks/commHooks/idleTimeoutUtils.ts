import axios from "axios";
import Swal from "sweetalert2";

// Define the type for the showModalOrNotification function
type ShowModalOrNotificationFunction = (title: string, message?: string) => void;

// Define the type for the clearUserData function
type ClearUserDataFunction = () => void;

// Define the IDLE_TIMEOUT_DURATION constant
const IDLE_TIMEOUT_DURATION = 60000; // 1 minute in milliseconds

const showModalOrNotification: ShowModalOrNotificationFunction = (title, message) => {
  // Use SweetAlert2 to display a modal or notification
  Swal.fire({
    title: title,
    text: message,
    icon: "info", // You can customize the icon (info, success, warning, error)
    confirmButtonText: "OK",
  });
};

// Placeholder function for clearing user data
const clearUserData: ClearUserDataFunction = () => {
  // Replace this with your actual logic for clearing user data
  console.log("Clearing User Data");
};

// Function to fetch the last user interaction time from the backend
const fetchLastUserInteractionTime = async (): Promise<number | null> => {
  try {
    const response = await axios.get("/api/getLastUserInteractionTime");
    return response.data.lastInteractionTime;
  } catch (error) {
    console.error("Error fetching last user interaction time:", error);
    // Handle error appropriately
    return 0; // Default value if the API call fails
  }
};

export {
  IDLE_TIMEOUT_DURATION,
  clearUserData,
  fetchLastUserInteractionTime,
  showModalOrNotification,
};
