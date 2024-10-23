import { Theme } from "../../libraries/ui/theme/Theme";

// CalendarEventAlternative.ts
interface CalendarEventAlternative {
    id: string;
    title: string;
    date: Date;
    location: string;
    duration: number; // Duration in minutes
    theme: Theme;
    // Add any additional properties specific to CalendarEventAlternative
  }
  
  export default CalendarEventAlternative;