// usePhaseMeta.ts
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { StructuredMetadata } from '@/app/config/StructuredMetadata';
import { createMeta } from "@/app/config/metadata/createMeta";
import { createMetadata } from '@/app/config/metadata/createMetadata';
import { useMetadata } from "@/app/config/useMetadata";
import { Attachment } from "@/app/documents/attachment/Attachment";
import { useEffect } from 'react';
import { useMeta } from "@/app/config/useMeta";


// Utility hooks for handling metadata
export const usePhaseMeta = <  
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T >(
  area: string | undefined, 
  initialPhaseMetadata: Partial<StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> = {}
) => {
  // Use `useMeta` hook to manage metadata
  const { metadata, setMetadata, updateMetadata } = useMeta<T, K, Meta>({
    ...createMeta<T, K>({ area, ...initialPhaseMetadata })
  });

  // Use `useMetadata` hook for unified metadata options
  const { options, setOptions, updateOptions } = useMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>({
    ...createMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>({ area })
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
