// CalendarEventAlternative.ts
import { Theme } from "@/app/libraries/ui/theme/Theme";

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