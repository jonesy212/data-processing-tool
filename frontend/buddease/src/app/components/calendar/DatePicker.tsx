// DatePicker.ts
import React from "react";

import { useState } from "react";
import Calendar from "./Calendar"; // Assuming Calendar is another component used for date selection






const DatePicker = ({ selectedDate, onSelectDate }) => {
  const [showCalendar, setShowCalendar] = useState(false);

  const toggleCalendar = () => {
    setShowCalendar((prevShowCalendar) => !prevShowCalendar);
  };

  const handleDateSelect = (date) => {
    onSelectDate(date);
    toggleCalendar();
  };

  return (
    <div className="date-picker">
      <input
        type="text"
        value={selectedDate}
        readOnly
        onClick={toggleCalendar}
        className="date-picker-input"
      />
      {showCalendar && (
        <div className="date-picker-calendar">
          <Calendar onSelectDate={handleDateSelect} />
        </div>
      )}
    </div>
  );
};

export default DatePicker;
