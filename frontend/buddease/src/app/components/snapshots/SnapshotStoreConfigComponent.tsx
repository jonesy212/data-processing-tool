// SnapshotStoreConfigComponent.tsx
import { Snapshot } from "@/app/components/snapshots";
import { SnapshotStoreConfig } from '@/app/components/snapshots/SnapshotStoreConfig';
import { useEffect, useState } from 'react';
import { SnapshotOperation, SnapshotOperationType } from "../snapshots/SnapshotActions";

interface SnapshotStoreConfigComponentProps<T extends Data, K extends Data> {
  config: SnapshotStoreConfig<T, K>;
  onUpdate?: (config: SnapshotStoreConfig<T, K>) => void;
  onError?: (error: Error) => void;
}

const SnapshotStoreConfigComponent = <T extends Data, K extends Data>({
  config,
  onUpdate,
  onError,
}: SnapshotStoreConfigComponentProps<T, K>) => {
  const [currentConfig, setCurrentConfig] = useState<SnapshotStoreConfig<T, K>>(config);

  useEffect(() => {
    // This effect could be used for initializing the component or handling config changes.
    if (onUpdate) {
      onUpdate(currentConfig);
    }
  }, [currentConfig, onUpdate]);

  const handleUpdateConfig = (newConfig: Partial<SnapshotStoreConfig<T, K>>) => {
    setCurrentConfig((prevConfig) => ({
      ...prevConfig,
      ...newConfig,
    }));

    if (onUpdate) {
      onUpdate(currentConfig);
    }
  };

  const handleSnapshotOperation = async (
    snapshot: Snapshot<T, K>,
    operation: SnapshotOperation,
    operationType: SnapshotOperationType
  ) => {
    try {
      const updatedSnapshot = await currentConfig.handleSnapshotOperation(snapshot, currentConfig, operation, operationType);
      console.log('Snapshot operation successful:', updatedSnapshot);
    } catch (error) {
      console.error('Snapshot operation failed:', error);
      if (onError) {
        onError(error as Error);
      }
    }
  };

  const handleClearSnapshot = () => {
    try {
      currentConfig.clearSnapshot?.();
      console.log('Snapshot cleared successfully');
    } catch (error) {
      console.error('Clearing snapshot failed:', error);
      if (onError) {
        onError(error as Error);
      }
    }
  };

  return (
    <div>
      <h3>{currentConfig.name || 'Snapshot Store Config'}</h3>
      <p>ID: {currentConfig.id}</p>
      <p>Category: {currentConfig.category}</p>

      {/* Example action buttons */}
      <button onClick={() => handleClearSnapshot()}>Clear Snapshot</button>
      <button
        onClick={() =>
          handleSnapshotOperation(
            { /* snapshot data */ } as Snapshot<T, K>,
            'Update' as SnapshotOperation,
            'update' as SnapshotOperationType
          )
        }
      >
        Perform Snapshot Operation
      </button>
    </div>
  );
};

export default SnapshotStoreConfigComponent;
