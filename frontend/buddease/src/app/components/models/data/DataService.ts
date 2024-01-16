// DataService.ts

import { useDispatch } from 'react-redux';
import { fetchDataAnalysisFailure, fetchDataAnalysisSuccess } from '../../state/redux/slices/DataAnalysisSlice';

const fetchData = async () => {
  const dispatch = useDispatch();

  try {
    dispatch(fetchDataAnalysisRequest());

    // Perform data fetching logic
    const dataAnalysis = await fetch('/api/dataAnalysis');
    
    dispatch(fetchDataAnalysisSuccess({ dataAnalysis }));
  } catch (error) {
    dispatch(fetchDataAnalysisFailure({ error: error.message }));
  }
};

export { fetchData };
