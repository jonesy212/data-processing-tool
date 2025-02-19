import ListGenerator from "@/app/generators/ListGenerator";
import React from "react";
import { DetailsItem } from "../../state/stores/DetailsListStore";

interface ChecklistItemProps {
  item: DetailsItem<any>; // Adjust the type of item to DetailsItem<any>
}

const ChecklistItem: React.FC<ChecklistItemProps> = ({ item }) => {
  // Extract item properties
  const { title, description, status, participants, startDate, endDate } = item;

  // Render participants list
  const renderParticipants = () => {
    if (!participants || participants.length === 0) {
      return <p>No participants</p>;
    }

    return (
      <div>
        <p>Participants:</p>
        <ul>
          {participants.map((participant, index) => (
            <li key={index}>{participant.memberName}</li>
          ))}
        </ul>
      </div>
    );
  };

  // Render the ChecklistItem
  return (
    <ListGenerator
      items={[item]}
      /* Render each item using DetailsListItem */
      {...({
        item,
        label,
        value,
      }: {
        item: DetailsItem<any>;
        label: string;
        value: string;
      }) => (
        <div className="checklist-item">
          <h2>{title || "Untitled"}</h2>
          <p>Description: {description || "No description available"}</p>
          <p>Status: {status || "Unknown"}</p>
          {renderParticipants()}
          <p>Start Date: {startDate ? startDate.toLocaleDateString() : 'Not specified'}</p>
          <p>Start Date: {endDate ? endDate.toLocaleDateString() : 'Not specified'}</p>
        </div>
      )}
    />
  );
};

export default ChecklistItem;
export type { ChecklistItemProps };;
