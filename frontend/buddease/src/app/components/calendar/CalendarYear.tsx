// CalendarYear.tsx

import { Month, MonthInfo } from "./Month";

// Define a type for representing a year in the calendar
interface CalendarYear {
    year: number;
    months: MonthInfo[]; // Array of MonthInfo representing the months in the year
}
  


type Year = number;

interface YearInfo {
  value: Year;
    description: string;
    
}

  
  // Define a type for representing a range of years
  type CalendarRange = CalendarYear[];
  
  // Define a function to generate a range of years with months
  function generateCalendarRange(startYear: number, endYear: number): CalendarRange {
    const calendarRange: CalendarRange = [];
    for (let year = startYear; year <= endYear; year++) {
      const calendarYear: CalendarYear = {
        year,
        months: generateMonths(),
      };
      calendarRange.push(calendarYear);
    }
    return calendarRange;
  }
  
  // Function to generate months for each year
  function generateMonths(): MonthInfo[] {
    return [
      {
          name: "January", index: 1,
          id: Month.January,
          color: "",
          description: ""
      },
      {
          name: "February", index: 2,
          id: Month.January,
          color: "",
          description: ""
      },
      {
          name: "March", index: 3,
          id: Month.January,
          color: "",
          description: ""
      },
      {
          name: "April", index: 4,
          id: Month.January,
          color: "",
          description: ""
      },
      {
          name: "May", index: 5,
          id: Month.January,
          color: "",
          description: ""
      },
      {
          name: "June", index: 6,
          id: Month.January,
          color: "",
          description: ""
      },
      {
          name: "July", index: 7,
          id: Month.January,
          color: "",
          description: ""
      },
      {
          name: "August", index: 8,
          id: Month.January,
          color: "",
          description: ""
      },
      {
          name: "September", index: 9,
          id: Month.January,
          color: "",
          description: ""
      },
      {
          name: "October", index: 10,
          id: Month.January,
          color: "",
          description: ""
      },
      {
          name: "November", index: 11,
          id: Month.January,
          color: "",
          description: ""
      },
      {
          name: "December", index: 12,
          id: Month.January,
          color: "",
          description: ""
      },
    ];
  }
  
  // Example usage
  const calendarRange: CalendarRange = generateCalendarRange(2022, 2025);
  console.log(calendarRange);
  

export const year: YearInfo[] = [
    { value: 2022, description: "Year 2022" },
    { value: 2023, description: "Year 2023" },
    // Add more years as needed
  ];
  
  export default year;
  export type { Year, YearInfo };
