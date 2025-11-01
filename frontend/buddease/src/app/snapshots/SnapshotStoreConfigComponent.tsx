// SnapshotStoreConfigComponent.tsx
import { SnapshotOperation, SnapshotOperationType } from "@/app/actions/SnapshotActions";
import { Attachment } from '@/app/documents/attachment/Attachment';
import { Snapshot } from '@/app/snapshots/Snapshot';
import { SnapshotStoreConfig } from '@/app/snapshots/SnapshotStoreConfig';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { useEffect, useState } from 'react';

interface SnapshotStoreConfigComponentProps<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  config: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  onUpdate?: (config: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
  onError?: (error: Error) => void;
}

const SnapshotStoreConfigComponent = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>({
  config,
  onUpdate,
  onError,
}: SnapshotStoreConfigComponentProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
  const [currentConfig, setCurrentConfig] = useState(config);

  useEffect(() => {
    if (onUpdate) {
      onUpdate(currentConfig);
    }
  }, [currentConfig, onUpdate]);

  const handleUpdateConfig = (newConfig: Partial<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>) => {
    setCurrentConfig((prevConfig) => ({
      ...prevConfig,
      ...newConfig,
    }));
  };

  const handleSnapshotOperation = async (
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    operation: SnapshotOperation<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    operationType: SnapshotOperationType
  ) => {
    try {
      const mockData = currentConfig;
      const mockMappedData = new Map<string, SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>();
      
      const updatedSnapshot = await currentConfig.handleSnapshotOperation(
        snapshot, 
        mockData, 
        mockMappedData, 
        operation, 
        operationType
      );
      console.log('Snapshot operation successful:', updatedSnapshot);
    } catch (error) {
      console.error('Snapshot operation failed:', error);
      if (onError) {
        onError(error as Error);
      }
    }
  };

  const handleClearSnapshot = async () => {
    try {
      if (currentConfig.clearSnapshots) {
        const result = currentConfig.clearSnapshots();
        if (result instanceof Promise) {
          await result;
        }
      }
      console.log('Snapshots cleared successfully');
    } catch (error) {
      console.error('Clearing snapshots failed:', error);
      if (onError) {
        onError(error as Error);
      }
    }
  };

  return (
    <div>
      <h3>{currentConfig.name || 'Snapshot Store Config'}</h3>
      <p>ID: {currentConfig.id}</p>
      <p>Category: {currentConfig.category ? String(currentConfig.category) : 'No category'}</p>

      <button onClick={handleClearSnapshot}>Clear Snapshot</button>
      <button
        onClick={() => {
          const mockSnapshot = {
            id: 'test-snapshot',
            data: {},
            // Add other required snapshot properties
          } as Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
          
          handleSnapshotOperation(
            mockSnapshot,
            { type: 'update', payload: {}, operationType: SnapshotOperationType.UpdateSnapshot } as SnapshotOperation<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
            'update' as SnapshotOperationType
          );
        }}
      >
        Perform Snapshot Operation
      </button>
    </div>
  );
};

export default SnapshotStoreConfigComponent;