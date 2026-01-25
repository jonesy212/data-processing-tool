// RandomWalkSuggestions.tsx

import { RandomWalkActions } from "@/core/hooks/userInterface/RandomWalkActions";
import type { RootState } from "@/core/state/redux/slices/RootSlice";
import { useDispatch, useSelector } from "react-redux";

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
