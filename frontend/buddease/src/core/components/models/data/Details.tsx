// Details.tsx

import { Label } from '@/core/branding/BrandingSettings';
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import { SharedIdentifiers } from '@/core/documents/RelatedProps';
import ListGenerator from "@/core/generators/ListGenerator";
import { FakeData } from "@/core/intelligence/FakeDataGenerator";
import type { CollaborationOptions } from "@/core/interfaces/options/CollaborationOptions";
import { Comment } from "@/core/models/comments/Comments";
import type { CommonData } from '@/core/models/CommonData';
import { Customizations } from '@/core/models/CommonData';
import type { Data } from "@/core/models/data/Data";
import { Phase } from '@/core/models/phases/Phase';
import { Participant } from "@/core/pages/management/ParticipantManagementPage";
import type { SharedMetadata } from '@/core/shared/SharedMetadata';
import { CustomComment } from "@/core/state/redux/slices/BlogSlice";
import { CommonEvent } from "@/core/state/stores/CommonEvent";
import type { DetailsItemExtended } from "@/core/state/stores/DetailsListStore";
import type { AppAttachment, AppEntity, AppExcludedFields, AppIncludedFields, AppK, AppMeta } from '@/core/typings/entities/AppEntity';
import type { EventAttachment, EventEntity, EventExcludedFields, EventIncludedFields, EventK, EventMeta } from '@/core/typings/entities/EventEntity';
import { observer } from "mobx-react-lite";
import React from "react";

export type DataAndEventDetails =
  | Data<AppEntity, AppK, AppMeta, AppAttachment, AppExcludedFields, AppIncludedFields>
  | CommonEvent<EventEntity, EventK, EventMeta, EventAttachment, EventExcludedFields, EventIncludedFields>;


interface SharedDetails<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends SharedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          SharedIdentifiers<T, K> {
  participants?: Participant[];
  uploadedAt?: Date;
  phase: Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  phaseName: string;
  fakeData?: FakeData;
  comments?: number | (Comment<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>  | CustomComment)[];
  isCompleted: boolean;
  currentMeta?: Meta;
  previousMeta?: Meta;
  label: Label;
}

interface DetailsProps<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  data?: CommonData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>; // Accept both CommonData and specific data type
  details: DetailsItemExtended<T>;
  customizations?: Customizations<T>;
  collaborationOptions?: CollaborationOptions;
}

const Details: React.FC<DetailsProps<DataAndEventDetails>> = observer(
  ({ details, data, collaborationOptions }) => {
    return (
      <div>
        <h3>{details.title}</h3>
        {details.phase && ( // Check if details.phase is not null or undefined
          <div>
            <p>Phase Description: {details.phase.description || "N/A"}</p>
            <p>Phase Name: {details.phase.name || "N/A"}</p>
          </div>
        )}
        <p>
          Team Members: {details.teamMembers?.join(", ") || "No team members"}
        </p>
        {/* Update the rendering of Start Date and End Date */}
        <p>
          Start Date:{" "}
          {details.phase?.startDate &&
          typeof details.phase.startDate !== "boolean"
            ? new Date(Number(details.phase.startDate)).toLocaleDateString()
            : "N/A"}
        </p>
        <p>
          End Date:{" "}
          {details.phase?.endDate && typeof details.phase.endDate !== "boolean"
            ? new Date(Number(details.phase.endDate)).toLocaleDateString()
            : "N/A"}
        </p>
        <div>
          <strong>Communication:</strong>
          <ul>
            {/* Update the logic based on the structure of details.communication */}
            {/* For example, if details.communication represents a specific action, access its properties accordingly */}
            <li>
              Audio:{" "}
              {details.communication && "audio" in details.communication
                ? details.communication.audio
                : "N/A"}
            </li>
            <li>
              Video:{" "}
              {details.communication && "video" in details.communication
                ? details.communication.video
                : "N/A"}
            </li>
            <li>
              Text:{" "}
              {details.communication && "text" in details.communication
                ? details.communication.text
                : "N/A"}
            </li>
          </ul>
        </div>
        <div>
          <strong>Collaboration Options:</strong>
          <ul>
            {/* Ensure collaborationOptions is an array and then map over it */}
            <ul>
              {/* Use ListGenerator component to render collaborationOptions */}
              <ListGenerator
                items={
                  Array.isArray(collaborationOptions)
                    ? collaborationOptions
                    : []
                }
              />
            </ul>
          </ul>
        </div>
        {/* Display cryptocurrency event details */}
        <div>
          <h4>Cryptocurrency Event Details</h4>
          <p>Event Title: {data?.title}</p>
          <p>Description: {data?.description}</p>
          <p>
            Start Date:{" "}
            {details.phase?.startDate
              ? new Date(details.phase.startDate).toLocaleDateString()
              : "N/A"}
          </p>
          <p>
            End Date:{" "}
            {details.phase?.endDate
              ? new Date(details.phase.endDate).toLocaleDateString()
              : "N/A"}
          </p>

          {/* Add more properties as needed */}
        </div>
      </div>
    );
  }
);

export default DetailsProps;
export { Details };
export type { SharedDetails };

