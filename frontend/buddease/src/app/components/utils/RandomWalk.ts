import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { RandomWalkActions } from "./RandomWalkActions";
import { addNotification } from "../../support/NotificationsSlice";
import { NotificationTypeEnum } from "../../support/NotificationContext";
import NOTIFICATION_MESSAGES from "../../support/NotificationMessages";

const RandomWalk = () => {
  const dispatch = useDispatch();

  const fetchRandomWalks = async () => {
    dispatch(RandomWalkActions.fetchRandomWalkRequest());

    try {
      // Simulate API call
      const response = await fetchRandomWalkData(); // Assuming fetchRandomWalkData is a function that fetches random walk data from an API
      dispatch(RandomWalkActions.fetchRandomWalkSuccess(response.randomWalk));
    } catch (error) {
      dispatch(RandomWalkActions.fetchRandomWalkFailure("Failed to fetch random walks"));
      addNotification({
        id: "",
        date: new Date(),
        type: NotificationTypeEnum.Error,
        content: "error",
        message: NOTIFICATION_MESSAGES.RandomWalk.FETCH_WALK_ERROR,
        createdAt: new Date(), // Add the createdAt property here
      });
    }
  };

  useEffect(() => {
    fetchRandomWalks();
  }, []); // Fetch random walks when the component mounts

  return (
    <div>
      <h2>Random Walk Component</h2>
      {/* You can render random walk data here */}
    </div>
  );
};

export default RandomWalk;

// Helper function to simulate fetching random walk data
const fetchRandomWalkData = () => {
  return new Promise((resolve, reject) => {
    // Simulate API call delay
    setTimeout(() => {
      // Simulated response
      const response = { randomWalk: [1, 2, 3] };
      resolve(response);
    }, 1000); // Simulated delay of 1 second
  });
};
