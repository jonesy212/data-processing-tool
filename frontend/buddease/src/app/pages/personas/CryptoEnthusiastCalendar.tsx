// CryptoEnthusiastCalendar.tsx
import { CustomEvent } from "@/app/components/event/BaseCustomEvent";
import EventService from "@/app/components/event/EventService";
import React, { useState } from "react";
import ProfessionalTraderCalendar from "./ProfessionalTraderCalendar"; // Import ProfessionalTraderCalendar component




const addEventListener = (
  type: string,
  listener: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions
): void => {
  // Check if the document exists
  if (document) {
    // Add event listener to the specified type with the provided listener and options
    document.addEventListener(type, listener, options);
    console.log(`Event listener added for type: ${type}`);
  } else {
    console.error("Document not found. Unable to add event listener.");
  }
};

interface CryptoEvent extends CustomEvent {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  description: string;
  stopImmediatePropagationEvent?: (event: CryptoEvent) => void;
  preventDefaultEvent?: (event: CryptoEvent) => void;
  preventDefault?: () => void;
  stopImmediatePropagation?: () => void;
  addEventListener: (type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) => void;
  removeEventListener: (type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) => void;
  dispatchEvent: (event: Event) => boolean;

}




interface CryptoEnthusiastCalendarProps {
  // Define props here, if any
}

const CryptoEnthusiastCalendar: React.FC<CryptoEnthusiastCalendarProps> = (
  props
) => {
  // Initialize the EventService
  const eventService = new EventService();

  // Add state to manage crypto events
  const [cryptoEvents, setCryptoEvents] = useState(eventService.getAllEvents());

  // Function to add a new crypto event
// Function to add a new crypto event
const addCryptoEvent = (
  id: string,
  title: string,
  startDate: Date,
  endDate: Date,
  description: string,
  addEventListener: (
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ) => void,
  removeEventListener: (
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ) => void,
  dispatchEvent: (event: Event) => boolean
) => {
  const event: CryptoEvent = {
    id,
    title,
    startDate,
    endDate,
    description,
    addEventListener,
    removeEventListener,
    dispatchEvent,
  };

  eventService.addEvent(event);
  setCryptoEvents(eventService.getAllEvents()); // Update the state with the new events
};

  

  // Function to remove a crypto event
  const removeCryptoEvent = (eventId: string) => {
    eventService.removeEvent(eventId);
    setCryptoEvents(eventService.getAllEvents()); // Update the state after removing the event
  };

  return (
    <div>
      <h1>Crypto Enthusiast Calendar</h1>
      {/* Include ProfessionalTraderCalendar component */}
      <ProfessionalTraderCalendar />
      {/* Display crypto events */}
      <div>
        <h2>My Crypto Events</h2>
        <ul>
          {cryptoEvents.map((event) => (
            <li key={event.id}>
              {event.title} - {event.startDate.toDateString()}
              <button onClick={() => removeCryptoEvent(event.id)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>
      {/* Form to add new crypto events */}
      <div>
        <h2>Add New Crypto Event</h2>
        <form
          onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            const target = e.target as typeof e.target & {
              title: { value: string };
              startDate: { value: string };
              endDate: { value: string };
            };
            const title = target.title.value;
            const startDate = new Date(target.startDate.value);
            const endDate = new Date(target.endDate.value);
            addCryptoEvent(
              String(Date.now()), // Generate unique ID
              title,
              startDate,
              endDate,
              "Crypto event", // Default description
              (type, listener, options) => {
                // Add event listener
                document.addEventListener(type, listener, options);
              },
              (type, listener, options) => {
                // Remove event listener
                document.removeEventListener(type, listener, options);
              },
              (event) => {
                // Dispatch event and return a boolean value
                return document.dispatchEvent(event);
              }
            );
          }}            
        >
          <label>
            Event Title:
            <input type="text" name="title" required />
          </label>
          <label>
            Start Date:
            <input type="date" name="startDate" required />
          </label>
          <label>
            End Date:
            <input type="date" name="endDate" required />
          </label>
          <button type="submit">Add Event</button>
        </form>
      </div>
    </div>
  );
};

export default CryptoEnthusiastCalendar;
