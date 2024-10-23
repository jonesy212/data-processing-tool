// MeetingScheduler.jsx
import { CalendarComponent } from '@/app/components/calendar/CalendarComponent';
import { useStore } from "../../hooks/useStore";
import { useCalendarManagerStore } from '../../state/stores/CalendarStore';


const MeetingScheduler = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const store = useStore(); // Access the MobX store

  
  const handleDateChange = (date) => {
    setSelectedDate(date);
    // Update the selected date in the store or perform any other necessary actions
    store.setSelectedDate(date);
  };


  const handleAddEvent = (newEvent) => {
    useCalendarManagerStore.addEvent(newEvent);
  };

  const handleRemoveEvent = (eventId) => {
    CalendarStore.removeEvent(eventId);
  };

  // Implement your meeting scheduling logic here

  return (
    <div>
      <h2>Meeting Scheduler</h2>
      {/* Add meeting scheduling UI components */}
      {/* Calendar view, propose meeting times, send invitations, etc. */}
      <h2>Meeting Scheduler</h2>
      {/* Calendar view */}
      <CalendarComponent selectedDate={selectedDate} onDateChange={handleDateChange} />
      {/* Propose meeting times */}
      <ProposeMeetingTimes />
      {/* Send invitations */}
      <SendInvitations />
      {/* Add more meeting scheduling UI components as needed */}
    
    </div>
  );
};

export default MeetingScheduler;
