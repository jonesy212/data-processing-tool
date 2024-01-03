// MonthView.jsx
import React from 'react';
import CalendarMonth from './CalendarMonth';

const MonthView = ({ year, month, events }) => {
  return (
    <div>
      <h2>Month View</h2>

      {selectedProject ? (
        // Render project detils
        <div>
          <h3>Project: {selectedProject.name}</h3>
          <h3>Project: {selectedProject.description}</h3>
          {/* Dispay other project details */}
        </div>
      ) : (
        // Render tasks for the month
        <div>
          {/* Map over tasks array and display each */}
            <TaskList tasks={tasks} />
            <h3>Tasks for {`${month}/${year}`}</h3>
            {/*Render tasks based on priority, data, etc. */}
        </div>
          
      )}
      {/* Display tasks, events, and milestones for the month */}
      <CalendarMonth year={year} month={month} events={events} />
    </div>
  );
};

export default MonthView;
