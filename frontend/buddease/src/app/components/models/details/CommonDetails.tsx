// CommonDetails.tsx

import { BaseData } from '@/app/models/data/Data';
import { StructuredMetadata } from "@/app/config/StructuredMetadata";
import React, { useState } from "react";
import { CommonData } from "@/app/models/CommonData";
import { Attachment } from "@/app/documents/attachment/Attachment";
import { BaseDataEntity, DefaultExcludedFields, DefaultIncludedFields, DefaultMeta } from '@/app/config/BaseConfig';


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
 
 const CommonDetails = <
   T extends BaseDataEntity,
   K extends T = T,
   Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
   AttachmentType extends Attachment = Attachment,
   ExcludedFields extends keyof T = DefaultExcludedFields<T>,
   IncludedFields extends keyof T = keyof T
 >({
   data,
   details,
   customizations,
 }: DetailsProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
   const [showDetails, setShowDetails] = useState(false);
   const userId = localStorage.getItem("id") || "";
   const timestamp = new Date().toISOString();
   const dispatch = useDispatch();
 
   const toggleDetails = () => {
     setShowDetails((prev) => !prev);
   };
 
   return (
     <div>
       <button onClick={toggleDetails}>Toggle Details</button>
       {showDetails && (
         <div>
           <h3>Details</h3>
           {data && (
             <div>
               <h4>Data Details</h4>
               {Object.entries(data).map(([key, value]) => (
                 <p key={key}>
                   {key}: {String(value)}
                 </p>
               ))}
             </div>
           )}
           {details && (
             <div>
               <h4>Additional Details</h4>
               {Object.entries(details).map(([key, value]) => (
                 <p key={key}>
                   {key}: {String(value)}
                 </p>
               ))}
             </div>
           )}
           {/* Render specific properties in a structured manner */}
           {data && (
             <div>
               <h4>Structured Rendering</h4>
               {data.tags && (
                 <div>
                   <p>Tags:</p>
                   <ul>
                     {Object.entries(data.tags).map(([key, value]) => (
                       <li key={key}>
                         {key}: {String(value)}
                       </li>
                     ))}
                   </ul>
                 </div>
               )}
               {data.title && <p>Title: {data.title}</p>}
               {data.description && <p>Description: {data.description}</p>}
               {data.startDate && data.endDate && (
                 <p>
                   Date: {new Date(data.startDate).toLocaleDateString()} to{" "}
                   {new Date(data.endDate).toLocaleDateString()}
                 </p>
               )}
             </div>
           )}
         </div>
       )}
 
       {showDetails && data && (
         <div>
           <h3>Details</h3>
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
                   {key}: {String(value)}
                 </p>
               );
             }
           })}
         </div>
       )}
 
       {/* Include RealtimeData component */}
       <RealtimeDataComponent
         id={data?.id ? data?.id.toString() : ""} // Updated from `_id` to `id` to match the property (`BaseRealtimeData.id: string`)
         name={data?.name || ""} // Match `RealtimeDataItem.name: string`
         date={data?.date ? new Date(data.date) : new Date()} // Handles both `string` and `Date`
         userId={userId}
         dispatch={dispatch}
         value={data?.value || ""} // Match `RealtimeDataItem.value: string`
         eventId={data?.eventId || ""} // Match `EventData.eventId: string`
         type={data?.type || {} as AllTypes} // Correct `AllTypes` type assignment
         timestamp={data?.timestamp ? new Date(data.timestamp) : new Date()}  // Handles both `string` and `Date`
         blockNumber={data?.blockNumber != null ? data.blockNumber.toString() : ""} // Convert `string | number | bigint | undefined` to `string`
         transactionHash={data?.transactionHash || ""} // Add fallback value `""` if `transactionHash` is `undefined`
         event={data?.event || ""} // Add fallback value `""` if `event` is `undefined`
         signature={data?.signature || ""} // Add fallback value `""` if `signature` is `undefined`
         latestVersion={data?.latestVersion || createDefaultVersionData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>()}
         schema={data?.schema || {}}
       />
     </div>
   );
};    
 
export { CommonDetails };
export type { Customizations, CommonDetailsProps };

