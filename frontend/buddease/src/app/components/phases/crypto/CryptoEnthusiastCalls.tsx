// CryptoEnthusiastCalls.tsx
import ListGenerator from '@/app/generators/ListGenerator';
import { DataAnalysisAction, DataAnalysisDispatch } from '@/app/typings/dataAnalysisTypes';
import { Dispatch } from '@reduxjs/toolkit';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import SnapshotList from '../../snapshots/SnapshotList';
import userService from '../../users/ApiUser';
import useTwoFactorAuthentication from '../../hooks/authentication/useTwoFactorAuthentication';
import processSnapshotList from '@/app/generators/processSnapshotList';
import DataFilterForm from '../../models/data/DataFilterForm';
import { TraderCallsProps } from '../../trading/Trades';
import { authToken } from '../../auth/authToken';

interface CryptoEnthusiastCallsProps extends TraderCallsProps {
  // Define any props needed for the component
}

const CryptoEnthusiastCalls: React.FC<CryptoEnthusiastCallsProps> = () => {
  const [filteredData, setFilteredData] = useState<Record<string, { operation: string; value: string | number }>>({});
  const [transform, setTransform] = useState('none');
  const { isTwoFactorEnabled, enableTwoFactor, disableTwoFactor } = useTwoFactorAuthentication();
  const [snapshotList, setSnapshotList] = useState<SnapshotList>(new SnapshotList());
  const dispatch: DataAnalysisDispatch = useDispatch<Dispatch<DataAnalysisAction>>();

  // Fetch user data and process snapshot list
  useEffect(() => {
    const fetchUserData = async () => {
      const userId = ''; // Add your user ID here
      const user = await userService.fetchUser(userId, authToken);
      // Process snapshot data and update state
      const processedSnapshotList = processSnapshotList(user.snapshots);
      setSnapshotList(processedSnapshotList);
    };

    fetchUserData();
  }, []);

  const handleSubmit = (filters: Record<string, { operation: string; value: string | number }>, transform: string) => {
    // Handle form submission, e.g., fetching data based on filters and transform
    // Update state or dispatch actions as needed
    setFilteredData(filters);
    setTransform(transform);
  };

  return (
    <div>
      <h2>Crypto Enthusiast Calls</h2>
      {/* Add any additional components or elements as needed */}
      <DataFilterForm
        onSubmit={handleSubmit}
        options={{}}
        onSearch={async ()=> {}}
      />
      {/* Display filtered data or other components based on the submitted filters */}
      {/* Add any additional logic or UI elements here */}
      <ListGenerator items={snapshotList.toArray()} />
      {/* Example usage of Two-Factor Authentication hook */}
      {isTwoFactorEnabled ? (
        <button onClick={disableTwoFactor}>Disable Two-Factor Authentication</button>
      ) : (
        <button onClick={enableTwoFactor}>Enable Two-Factor Authentication</button>
      )}
    </div>
  );
};

export default CryptoEnthusiastCalls;
