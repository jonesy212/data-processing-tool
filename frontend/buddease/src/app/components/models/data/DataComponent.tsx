// DataComponent.tsx

import { useSelector } from 'react-redux';
import { useAuth } from '../../auth/AuthContext';

const DataComponent: React.FC = () => {
  const {state} =useAuth()
  const { dataAnalysis } = useSelector((state) => state.dataAnalysis);

  // Render your component using dataAnalysis state

  return (
    <div>
      {/* Display dataAnalysis information */}
    </div>
  );
};

export default DataComponent;
