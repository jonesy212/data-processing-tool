// CalendarEventAlternative.ts
import { Theme } from "@/core/libraries/ui/theme/Theme";

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