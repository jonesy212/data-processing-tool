// components/Details.tsx
import { observer } from 'mobx-react-lite';
import React from 'react';
import { DetailsItem } from '../../state/stores/DetailsListStore';

interface DetailsProps {
  details: DetailsItem;
}

const Details: React.FC<DetailsProps> = observer(({ details }) => {
  // Assuming details has properties like title, description, etc.
  return (
    <div>
      <h3>{details.title}</h3>
      <p>{details.description}</p>
      <p>Phase: {details.phase}</p>
      <p>Team Members: {details.teamMembers.join(', ')}</p>
      <p>Start Date: {new Date(details.startDate).toLocaleDateString()}</p>
      <p>End Date: {new Date(details.endDate).toLocaleDateString()}</p>
      {/* Add more properties rendering as needed */}
      <div>
        <strong>Communication:</strong>
        <ul>
          <li>Audio: {details.communication.audio ? 'Supported' : 'Not Supported'}</li>
          <li>Video: {details.communication.video ? 'Supported' : 'Not Supported'}</li>
          <li>Text: {details.communication.text ? 'Supported' : 'Not Supported'}</li>
        </ul>
      </div>
      <div>
        <strong>Collaboration Options:</strong>
        <ul>
          {details.collaborationOptions.map((option, index) => (
            <li key={index}>{option}</li>
          ))}
        </ul>
      </div>
    </div>
  );
});

export default Details;
