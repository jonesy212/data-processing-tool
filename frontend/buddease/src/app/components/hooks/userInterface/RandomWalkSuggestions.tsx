// RandomWalkSuggestions.tsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RandomWalkActions } from "../redux/actions/RandomWalkActions";
import { RootState } from "../../state/redux/slices/RootSlice";

const RandomWalkSuggestions = () => {
  const dispatch = useDispatch();
  const randomWalks = useSelector((state: RootState) => state.randomWalk.randomWalks);

  useEffect(() => {
    // Dispatch action to fetch random walks when component mounts
    dispatch(RandomWalkActions.fetchRandomWalksRequest());
  }, [dispatch]);

  return (
    <div>
      <h2>Random Walk Suggestions</h2>
      <ul>
        {randomWalks.map((walk, index) => (
          <li key={index}>{walk}</li>
        ))}
      </ul>
    </div>
  );
};

export default RandomWalkSuggestions;
