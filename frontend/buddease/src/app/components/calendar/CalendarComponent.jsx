import DataFrameAPI from "@/app/api/DataframeApi";
import FullCalendar from "@fullcalendar/react";
import ProgressBar from "../models/tracker/ProgressBar";
import { useCalendarContext } from "./CalendarContext";

const CalendarWrapper = () => {
  const { calendarData, updateCalendarData } = useCalendarContext();
  const dataFrameAPI = new DataFrameAPI(); // Initialize your DataFrameAPI instance
  const progress = calendarData.length > 0 ? calendarData[0].projects[0].progress : 0;

  const handleEventDrop = async (event) => {
    try {
      updateCalendarData((prevData) => {
        const updatedData = prevData.map((item) =>
          item.id === event.id ? { ...item, start: event.start } : item
        );
        return updatedData;
      });

      await axiosInstance.addCalendarEvent(event);
      // Call DataFrameAPI to update the backend data
      await dataFrameAPI.updateDataFrame(calendarData); // Corrected method call

    } catch (error) {
      console.error("Error handling event drop:", error);
    }
  };


  const handleAddEvent = async () => {
    try {
      // Define your new event properties here
      const newEvent = {
        title: "Project Kickoff Meeting",
        start: new Date(), // Example start date/time
        end: new Date(), // Example end date/time
        description: "Discuss project goals and objectives",
        location: "Online",
        attendees: ["User1", "User2", "User3"], // List of attendees
        phase: "Ideation", // Phase of the project (e.g., Ideation, Team Creation, Product Brainstorming, Product Launch, Data Analysis)
        communicationOptions: ["Audio", "Video", "Text", "Collaboration Tools"], // Communication options for realtime communication
        communityBased: true, // Indicates if the project is community-based
        globalProject: true, // Indicates if the project is global
        purpose: "Promote unity and achieve results that benefit humanity",
        impact: "Create solutions with a positive impact on everyone involved",
        guestSpeakers: ["Speaker2", "Speaker3", "Speaker4"], // List of guest speakers
        hosts: ["Host1", "Host2", "Host3",], // Speaker for the project
      };

      // Call the addCalendarEvent function to add the new event
      await addCalendarEvent(newEvent);

      // Optionally, you can update the local calendar data after adding the event
      
      updateCalendarData((prevData) => [...prevData, newEvent]);

    } catch (error) {
      console.error("Error adding calendar event:", error);
    }
  };


  const addCalendarEvent = async (newEvent) => { // Removed TypeScript type annotation
    try {
      // Assume axiosInstance and endpoints are imported correctly
      const response = await axiosInstance.post(endpoints.calendar.events, newEvent);

      if (response.status === 200 || response.status === 201) {
        const createdEvent = response.data;

        // Update frontend data with the newly created event
        updateCalendarData((prevData) => [...prevData, createdEvent]);

        // Update backend data using DataFrameAPI
        await dataFrameAPI.appendDataToBackend(createdEvent); // Corrected method call
      } else {
        console.error('Failed to add calendar event:', response.statusText);
      }
    } catch (error) {
      console.error('Error adding calendar event:', error);
      throw error;
    }
  };

  return (
    <div>
      <h2>Task Calendar</h2>
      <FullCalendar events={calendarData} eventDrop={handleEventDrop} />
      <ProgressBar
        progress={progress} 
        
        />
      {/* Your calendar component goes here */}
      <button onClick={handleAddEvent}>Add Event</button> {/* Button to trigger adding an event */}
    
    </div>
  );
};

export default CalendarWrapper;
