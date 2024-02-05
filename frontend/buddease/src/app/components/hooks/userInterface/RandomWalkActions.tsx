// RandomWalkActions.ts
import { useNotification } from '@/app/components/hooks/commHooks/useNotification';
import { createAction } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import NOTIFICATION_MESSAGES from "../../support/NotificationMessages";
// Define actions
export const RandomWalkActions = {
  fetchRandomWalkRequest: createAction<number>("fetchRandomWalkRequest"),
  fetchRandomWalkSuccess: createAction<{ randomWalk: number[] }>("fetchRandomWalkSuccess"),
  fetchRandomWalkFailure: createAction<{ error: string }>("fetchRandomWalkFailure"),

  updateRandomWalkRequest: createAction<{ randomWalkId: number; randomWalkData: number[] }>("updateRandomWalkRequest"),
  updateRandomWalkSuccess: createAction<{ randomWalk: number[] }>("updateRandomWalkSuccess"),
  updateRandomWalkFailure: createAction<{ error: string }>("updateRandomWalkFailure"),

  // Batch actions for fetching, updating, and removing random walks
  batchFetchRandomWalksRequest: createAction("batchFetchRandomWalksRequest"),
  batchFetchRandomWalksSuccess: createAction<{ randomWalks: number[][] }>("batchFetchRandomWalksSuccess"),
  batchFetchRandomWalksFailure: createAction<{ error: string }>("batchFetchRandomWalksFailure"),

  batchUpdateRandomWalksRequest: createAction<{ ids: number[]; newRandomWalks: number[][] }>("batchUpdateRandomWalksRequest"),
  batchUpdateRandomWalksSuccess: createAction<{ randomWalks: number[][] }>("batchUpdateRandomWalksSuccess"),
  batchUpdateRandomWalksFailure: createAction<{ error: string }>("batchUpdateRandomWalksFailure"),

  batchRemoveRandomWalksRequest: createAction<number[]>("batchRemoveRandomWalksRequest"),
  batchRemoveRandomWalksSuccess: createAction<number[]>("batchRemoveRandomWalksSuccess"),
  batchRemoveRandomWalksFailure: createAction<{ error: string }>("batchRemoveRandomWalksFailure"),

  updateRandomWalkDetails: createAction<{ randomWalkId: number; details: any }>("updateRandomWalkDetails"),
};

// Usage example in a component
const ExampleComponent = () => {
  const dispatch = useDispatch();
  const { addNotification } = useNotification();

  const fetchRandomWalks = () => {
    dispatch(RandomWalkActions.fetchRandomWalkRequest(1));

    try {
      // Simulate API call
      const response = { randomWalk: [1, 2, 3] };
      dispatch(RandomWalkActions.fetchRandomWalkSuccess(response));
    } catch (error) {
      dispatch(RandomWalkActions.fetchRandomWalkFailure({ error: "Failed to fetch random walks" }));
      addNotification({
        id: "",
        date: new Date(),
        type: "Error",
        content: "error",
        message: NOTIFICATION_MESSAGES.RandomWalk.FETCH_WALK_ERROR,
        createdAt: new Date(), // Add the createdAt property here
      });
    };
  }

  return (
    <button onClick={fetchRandomWalks}>Fetch Random Walks</button>
  );
};

export default ExampleComponent;
