// ContentDetailsListItem.tsx
import React from 'react';
import { DetailsItemExtended } from '../../state/stores/DetailsListStore';
import { Data } from '../data/Data';
import { Member } from '../teams/TeamMembers';

interface ContentDetailsListItemProps {
  item: DetailsItemExtended
}

const ContentDetailsListItem: React.FC<ContentDetailsListItemProps> = ({ item }) => {
  const { title, description, status, participants, startDate, endDate } = item;

  const renderParticipants = () => {
    if (!participants || participants.length === 0) {
      return <p>No participants</p>;
    }

    return (
      <div>
        <p>Participants:</p>
        <ul>
          {participants.map((participant: Member, index: number) => (
            <li key={index}>{participant.memberName}</li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="details-list-item">
      <h2>{title || 'Untitled'}</h2>
      <p>Description: {description || 'No description available'}</p>
      <p>Status: {status || 'Unknown'}</p>
      {renderParticipants()}
      <p>Start Date: {startDate ? startDate.toDateString() : 'Not specified'}</p>
      <p>End Date: {endDate ? endDate.toDateString() : 'Not specified'}</p>
      {/* Render other details as needed */}
    </div>
  );
};

export default ContentDetailsListItem;

















