import { DataAnalysisDispatch } from "@/app/typings/dataAnalysisTypes";
import axiosInstance from "../security/csrfToken";

// dataAnalysisUtils.ts
export const fetchData = async (userId: string, dispatch: DataAnalysisDispatch) => {
    try {
      const userSpecificData = await axiosInstance.get(`/api/user/${userId}`);
      dispatch({ type: "SET_USER_DATA", payload: userSpecificData.data });
      // Additional data processing or dispatching actions as needed
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  
