import React from 'react';
import MonthView from './MonthView';

const QuarterView = ({ year, quarter, events }) => {
  return (
    <div>
      <h2>Quarter View</h2>
      {/* Display months for the quarter */}
      <div>
        <h3>Months for Q{quarter}, {year}</h3>
        {/* Render MonthView for each month in the quarter */}
        {[1, 2, 3].map(month => (
          <MonthView key={month} year={year} month={(quarter - 1) * 3 + month} events={events} />
        ))}
      </div>
    </div>
  );
};

export default QuarterView;
