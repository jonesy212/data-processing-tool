// DatePickerComponent.tsx
import React from 'react';
import DatePicker from 'react-datepicker'; // Import react-datepicker

interface DatePickerProps {
    selectedDate: Date;
    onChange: (date: Date) => void;
}
const DatePickerComponent: React.FC<DatePickerProps> = ({ selectedDate, onChange }) => {
  return (
    <DatePicker
      selected={selectedDate} // Pass the selected date
      onChange={onChange} // Pass the onChange event handler
    />
  );
};

export default DatePickerComponent;
