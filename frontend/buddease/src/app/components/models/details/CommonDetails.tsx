// CommonDetails.tsx

import { BaseData } from '@/app/models/data/Data';
import { StructuredMetadata } from "@/config/StructuredMetadata";
import React, { useState } from "react";
import { CommonData } from "@/app/models/CommonData";
import { Attachment } from "@/app/documents/attachment/Attachment";

import { BaseDataEntity, DefaultExcludedFields, DefaultIncludedFields, DefaultMeta } from '@/config/BaseConfig';


interface Customizations<T> {
  [key: string]: (value: any) => React.ReactNode;
}

// Define the CommonDetailsProps interface with the generic CommonData type
interface CommonDetailsProps<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  data?: CommonData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  customizations?: Customizations<T>;
}
  
// CommonDetails component for displaying common details
const CommonDetails = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T>({
  data,
  customizations,
}: CommonDetailsProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
  const [showDetails, setShowDetails] = useState(false);

  const toggleDetails = () => {
    setShowDetails((prev) => !prev);
  };

  return (
    <div>
      <button onClick={toggleDetails}>Toggle Details</button>
      {showDetails && data && (
        <div>
          <h3>Common Details</h3>
          {/* Handle different data types here */}
          {Object.entries(data).map(([key, value]) => {
            // Check if a customization function exists for this key
            const renderFunction = customizations && customizations[key];
            if (renderFunction) {
              return renderFunction(value);
            } else {
              // Default rendering if no customization function is provided
              return (
                <p key={key}>
                  {key}: {value as React.ReactNode}
                </p>
              );
            }
          })}
        </div>
      )}
    </div>
  );
};

export { CommonDetails };
export type { Customizations };

