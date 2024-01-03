import axios from "axios";
import React, { useState } from "react";

interface SyncWithExternalCalendarsProps {
  // Props for connecting to Google Calendar
  googleCalendarApiKey: string; // API key for Google Calendar API
  onConnectToGoogleCalendar: (accessToken: string) => void; // Callback when connected
  onDisconnectFromGoogleCalendar: () => void; // Callback when disconnected

  // Props for handling trackers from Google Calendar
  onSanitizeTrackers: (trackers: string[]) => string[]; // Callback to sanitize trackers

  // Add more specific props needed for SyncWithExternalCalendars here
}

const SyncWithExternalCalendars: React.FC<SyncWithExternalCalendarsProps> = ({
  googleCalendarApiKey,
  onConnectToGoogleCalendar,
  onDisconnectFromGoogleCalendar,
  onSanitizeTrackers,
}) => {
  // Define the accessToken state and its setter
  const [accessToken, setAccessToken] = useState<string | null>(null);
  // Render connect/disconnect button based on accessToken

  // Add your component logic here for connecting to Google Calendar and handling trackers

  const handleConnectToGoogleCalendar = async () => {
    try {
        // Perform authentication and obtain access token
        // # todo update this information to with actual Google Calendar access
      const authResponse = await axios.post(
        "https://www.googleapis.com/oauth2/v4/token",
        {
          client_id: "your-client-id",
          client_secret: "your-client-secret",
          refresh_token: "your-refresh-token",
          grant_type: "refresh_token",
        }
      );

      const newAccessToken = authResponse.data.access_token;
      setAccessToken(newAccessToken);

      // Trigger callback with the access token
      onConnectToGoogleCalendar(newAccessToken);
    } catch (error) {
      console.error("Error connecting to Google Calendar:", error);
    }
  };

  const handleDisconnectFromGoogleCalendar = () => {
    // Perform logic to disconnect from Google Calendar
    setAccessToken(null);

    // Trigger callback for disconnection
    onDisconnectFromGoogleCalendar();
  };

  const handleSanitizeTrackers = (trackers: string[]) => {
    // Implement logic to sanitize trackers received from Google Calendar
    const sanitizedTrackers = onSanitizeTrackers(trackers);
    // Set the sanitized trackers in the component state
    return sanitizedTrackers;
  };

  // Example of using the function
  const trackers = ["tracker1", "tracker2", "tracker3"];
  const sanitizedTrackers = handleSanitizeTrackers(trackers);

  return (
    <div>
      <h3>Sync with External Calendars Component</h3>
      {/* Add your component content here */}
      <button onClick={handleConnectToGoogleCalendar}>
        Connect to Google Calendar
      </button>
      <button onClick={handleDisconnectFromGoogleCalendar}>
        Disconnect from Google Calendar
      </button>
      {/* Add more UI elements for handling trackers */}
      <div>
        {/* Display sanitized trackers */}
        <p>Sanitized Trackers: {sanitizedTrackers.join(", ")}</p>
      </div>
      <SyncWithExternalCalendars
        googleCalendarApiKey="your-api-key"
        onConnectToGoogleCalendar={handleConnectToGoogleCalendar}
        onDisconnectFromGoogleCalendar={handleDisconnectFromGoogleCalendar}
        onSanitizeTrackers={handleSanitizeTrackers}
      />
    </div>
  );
};

export default SyncWithExternalCalendars;
