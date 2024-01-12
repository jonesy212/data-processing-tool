// dataAnalysisService.ts
import axios from "axios";

export const sendDataToBackend = async (data: any) => {
  try {
    // Example: Send processed data to the backend
    const response = await axios.post("/api/data-analysis", data);
    console.log("Data sent to backend:", response.data);
  } catch (error) {
    console.error("Error sending data to backend:", error);
  }
};
