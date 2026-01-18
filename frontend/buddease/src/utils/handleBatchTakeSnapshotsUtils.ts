// handleBatchTakeSnapshotsUtils.ts
import { SnapshotActions } from '@/core/actions/SnapshotActions';
import { useDispatch } from 'react-redux';

// Define the handleBatchTakeSnapshots function
const handleBatchTakeSnapshots = async (snapshotData: any) => {
    const dispatch = useDispatch();

    try {
        // Assuming batchTakeSnapshots is a thunk action
        dispatch(SnapshotActions.batchTakeSnapshots(snapshotData));
        // Handle the result if needed
    } catch (error) {
        // Handle errors
    }
};

export default handleBatchTakeSnapshots;
