import { DataAnalysisDispatch } from "@/app/typings/dataAnalysisTypes";
import axios from "axios";

// dataAnalysisUtils.ts
export const fetchData = async (userId: string, dispatch: DataAnalysisDispatch) => {
    try {
      const userSpecificData = await axios.get(`/api/user/${userId}`);
      dispatch({ type: "SET_USER_DATA", payload: userSpecificData.data });
      // Additional data processing or dispatching actions as needed
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  
