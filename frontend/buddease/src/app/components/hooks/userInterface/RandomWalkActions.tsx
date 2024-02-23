import { createAction } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import { addNotification } from "../../support/NofiticationsSlice";
import NOTIFICATION_MESSAGES from "../../support/NotificationMessages";

export const RandomWalkActions = {
  // Fetch random walk actions
  fetchRandomWalkRequest: createAction<number>("randomWalk/fetchRequest"),
  fetchRandomWalkSuccess: createAction<number[]>("randomWalk/fetchSuccess"),
  fetchRandomWalkFailure: createAction<string>("randomWalk/fetchFailure"),

  // Update random walk actions
  updateRandomWalkRequest: createAction<{ id: number; data: number[] }>("randomWalk/updateRequest"),
  updateRandomWalkSuccess: createAction<number[]>("randomWalk/updateSuccess"),
  updateRandomWalkFailure: createAction<string>("randomWalk/updateFailure"),

  // Batch actions for random walks
  batchFetchRandomWalksRequest: createAction<void>("randomWalk/batchFetchRequest"),
  batchFetchRandomWalksSuccess: createAction<number[][]>("randomWalk/batchFetchSuccess"),
  batchFetchRandomWalksFailure: createAction<string>("randomWalk/batchFetchFailure"),

  batchUpdateRandomWalksRequest: createAction<{ ids: number[]; data: number[][] }>("randomWalk/batchUpdateRequest"),
  batchUpdateRandomWalksSuccess: createAction<number[][]>("randomWalk/batchUpdateSuccess"),
  batchUpdateRandomWalksFailure: createAction<string>("randomWalk/batchUpdateFailure"),

  // Batch remove actions for random walks
  batchRemoveRandomWalksRequest: createAction<number[]>("randomWalk/batchRemoveRequest"),
  batchRemoveRandomWalksSuccess: createAction<number[]>("randomWalk/batchRemoveSuccess"),
  batchRemoveRandomWalksFailure: createAction<string>("randomWalk/batchRemoveFailure"),

  // Update random walk details action
  updateRandomWalkDetails: createAction<{ id: number; details: any }>("randomWalk/updateDetails"),
};

// Usage example in a component
const ExampleComponent = () => {
  const dispatch = useDispatch();

  const fetchRandomWalks = () => {
    dispatch(RandomWalkActions.fetchRandomWalkRequest(1));

    try {
      // Simulate API call
      const response = { randomWalk: [1, 2, 3] };
      dispatch(RandomWalkActions.fetchRandomWalkSuccess(response.randomWalk));
    } catch (error) {
      dispatch(
        RandomWalkActions.fetchRandomWalkFailure(
         "Failed to fetch random walks",
        )
      );
      addNotification({
        id: "",
        date: new Date(),
        type: "Error",
        content: "error",
        message: NOTIFICATION_MESSAGES.RandomWalk.FETCH_WALK_ERROR,
        createdAt: new Date(), // Add the createdAt property here
      });
    }
  };

  return <button onClick={fetchRandomWalks}>Fetch Random Walks</button>;
};

export default ExampleComponent;
