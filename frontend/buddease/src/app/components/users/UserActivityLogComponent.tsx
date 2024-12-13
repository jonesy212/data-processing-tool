// Import necessary libraries
import axiosInstance from "@/app/components/security/csrfToken";
import React, { useEffect, useState } from "react";

const UserActivityLogComponent = () => {
  const [userActivityLog, setUserActivityLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserActivityLog = async () => {
      try {
        // Make a GET request to the backend endpoint
        const response = await axios

        // Update the state with the fetched user activity log
        setUserActivityLog(response.data);
      } catch (error: any) {
        // Handle errors
        setError(error.message || 'An error occurred');
      } finally {
        // Update loading state regardless of success or failure
        setLoading(false);
      }
    };

    // Call the fetch function
    fetchUserActivityLog();
  }, []); // Empty dependency array to run the effect only once on mount

  // Render loading state while data is being fetched
  if (loading) {
    return <div>Loading...</div>;
  }

  // Render error state if there was an issue fetching the data
  if (error) {
    return <div>Error: {error}</div>;
  }

  // Render user activity log data
  return (
    <div>
      <h2>User Activity Log</h2>
      {userActivityLog.length > 0 ? (
        <ul>
          {userActivityLog.map((entry, index) => (
            <li key={index}>
              Action: {entry.action}, Timestamp: {entry.timestamp}
            </li>
          ))}
        </ul>
      ) : (
        <p>No user activity log found</p>
      )}
    </div>
  );
};

export default UserActivityLogComponent;
