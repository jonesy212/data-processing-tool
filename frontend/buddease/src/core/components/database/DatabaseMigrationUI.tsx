// DatabaseMigrationUI.tsx
import type { ProjectConfig } from '@/core/config/ProjectConfig';
import type { useButtonGeneratorProps } from '@/core/generators/GenerateButtons';
import React, { useEffect, useState } from 'react';
import { DatabaseMigrationService } from './DatabaseMigrationService';

interface DatabaseMigrationUIProps {
  projectConfig: ProjectConfig;
  sourceDatabase: any;
  targetDatabase: any;
}

export const DatabaseMigrationUI: React.FC<DatabaseMigrationUIProps> = ({
  projectConfig,
  sourceDatabase,
  targetDatabase
}) => {
  const [migrationService, setMigrationService] = useState<DatabaseMigrationService | null>(null);
  const [progress, setProgress] = useState<any>(null);
  const [isMigrating, setIsMigrating] = useState(false);
  
  const { buttonProps } = useButtonGeneratorProps();

  useEffect(() => {
    const service = new DatabaseMigrationService(projectConfig);
    setMigrationService(service);
  }, [projectConfig]);

  const handleStartMigration = async () => {
    if (!migrationService) return;
    
    setIsMigrating(true);
    try {
      await migrationService.execute(sourceDatabase, targetDatabase);
      console.log('Migration completed successfully!');
    } catch (error) {
      console.error('Migration failed:', error);
    } finally {
      setIsMigrating(false);
    }
  };

  const migrationButtonProps = {
    ...buttonProps,
    onSubmit: handleStartMigration,
    label: {
      ...buttonProps.label,
      submit: isMigrating ? "Migrating..." : "Start Migration",
      cancel: "Cancel Migration"
    },
    disabled: isMigrating
  };

  return (
    <div className="database-migration-ui">
      <h2>Database Migration</h2>
      
      <div className="migration-progress">
        {progress && (
          <>
            <div>Status: {progress.status}</div>
            <div>Progress: {progress.progress}%</div>
            <div>Current Step: {progress.currentStep}</div>
          </>
        )}
      </div>

      <ButtonGenerator {...migrationButtonProps} />

      {progress?.errors.length > 0 && (
        <div className="migration-errors">
          <h3>Errors:</h3>
          {progress.errors.map((error, index) => (
            <div key={index} className="error">{error}</div>
          ))}
        </div>
      )}
    </div>
  );
};