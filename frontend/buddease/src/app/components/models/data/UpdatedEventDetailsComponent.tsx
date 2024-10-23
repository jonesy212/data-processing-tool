// UpdatedEventDetailsComponent.tsx
import React, { useEffect, useState } from 'react';
import { CalendarEventViewingDetailsProps } from '../../calendar/CalendarEventViewingDetails';
import { RealtimeDataItem } from '../realtime/RealtimeData';

interface UpdatedEventDetailsProps extends CalendarEventViewingDetailsProps {
  realtimeData: RealtimeDataItem[]; // Pass the real-time data as props
}

const UpdatedEventDetailsComponent: React.FC<UpdatedEventDetailsProps> = (
  props
) => {
  // Destructure props
  const { eventId, title, date, productId, realtimeData } = props;

  // State to manage edited details
  const [editedTitle, setEditedTitle] = useState(title);
  const [editedDate, setEditedDate] = useState(date);

  // Function to handle title change
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedTitle(e.target.value);
  };

  // Function to handle date change
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedDate(e.target.value);
  };

  // Function to handle save changes
  const handleSaveChanges = () => {
    // Perform actions to save changes, e.g., update details in the database
    console.log('Saving changes...');
  };

  // Effect to update details when real-time data changes
  useEffect(() => {
    // Find the real-time data for the current event
    const eventData = realtimeData.find((item) => item.id === eventId);
    if (eventData) {
      // Update title and date based on real-time data
      setEditedTitle(eventData.name);
      setEditedDate(eventData.date.toString());
    }
  }, [eventId, realtimeData]);

  return (
    <div>
      <h2>Event Details</h2>
      <p>Event ID: {eventId}</p>
      <div>
        <label htmlFor="title">Title:</label>
        <input type="text" id="title" value={editedTitle} onChange={handleTitleChange} />
      </div>
      <div>
        <label htmlFor="date">Date:</label>
        <input type="date" id="date" value={editedDate?.toString().split('T')[0]} onChange={handleDateChange} />
      </div>
      <p>Product ID: {productId}</p>
      <button onClick={handleSaveChanges}>Save Changes</button>
      {/* Add more details or components as needed */}
    </div>
  );
};

export default UpdatedEventDetailsComponent;
