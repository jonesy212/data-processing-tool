import axiosInstance from "@/app/api/axiosInstance";
import { Data } from "../../models/data/Data";
import { Snapshot } from "../../snapshots";

const sendToAnalytics = <T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(eventName: string, eventData: Record<string, any>, snapshot: Snapshot<T, Meta, K>) => {
  try {
    // Example: Interacting with a third-party analytics platform (like Mixpanel)
    if (window.mixpanel) {
      window.mixpanel.track(eventName, eventData);
      console.log(`Analytics Event Sent: ${eventName}`, eventData);
    }

    // If a custom analytics service is in use
    const analyticsPayload = {
      event: eventName,
      data: eventData,
      timestamp: new Date().toISOString(),
    };

    // Send data to the backend analytics service
    axiosInstance.post('/analytics', analyticsPayload)
      .then((response) => {
        console.log("Analytics data successfully sent:", response.data);
      })
      .catch((error) => {
        console.error("Error sending analytics data:", error);
      });

  } catch (error) {
    console.error("Failed to send analytics event:", eventName, error);
  }
};
export { sendToAnalytics };
