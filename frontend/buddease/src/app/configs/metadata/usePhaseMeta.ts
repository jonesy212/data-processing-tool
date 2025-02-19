import { BaseData } from '@/app/components/models/data/Data';
import { StructuredMetadata } from '@/app/configs/StructuredMetadata';
import { useState, useEffect } from 'react';
import { useMetadata } from "@/app/configs/useMetadata";
import { usePhaseMeta } from "@/app/configs/metadata/usePhaseMeta";
import { BaseData } from "../models/data/Data";
import { createMeta } from "@/app/configs/metadata/createMetadataState";
import { createMetadata } from '../../configs/metadata/createMetadata';

// Utility hooks for handling metadata
export const usePhaseMeta = <T extends BaseData<any>, K extends T = T>(
  area: string | undefined, 
  initialPhaseMetadata: Partial<StructuredMetadata<T, K>> = {}
) => {
  // Use `useMeta` hook to manage metadata
  const { metadata, setMetadata, updateMetadata } = useMeta<T, K>({
    ...createMeta<T, K>({ area, ...initialPhaseMetadata })
  });

  // Use `useMetadata` hook for unified metadata options
  const { options, setOptions, updateOptions } = useMetadata<T, K>({
    ...createMetadata<T, K>({ area })
  });

  // Update the metadata when area changes
  useEffect(() => {
    if (area) {
      updateMetadata({ area });
      updateOptions({ area });
    }
  }, [area]);

  return { 
    phaseMetadata: metadata, 
    setPhaseMetadata: setMetadata, 
    updatePhaseMetadata: updateMetadata, 
    phaseOptions: options, 
    setPhaseOptions: setOptions, 
    updatePhaseOptions: updateOptions 
  };
};
